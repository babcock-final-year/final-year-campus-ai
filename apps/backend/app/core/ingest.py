import argparse
import hashlib
import json
import os

from config import CHROMA_PATH, DATA_DIRECTORY

from ..services.logger import get_logger
from .rag.loader import DocumentLoader
from .rag.splitter import DocumentSplitter
from .rag.vectorstore import VectorStore

logger = get_logger(__name__)

SUPPORTED_EXTENSIONS = {".md", ".txt", ".csv", ".json"}


def get_file_hash(filepath: str) -> str:
    with open(filepath, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()


def load_hash_store(path: str) -> dict:
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {}


def save_hash_store(store: dict, path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(store, f, indent=2)


def generate_chunk_id(chunk) -> str:
    """Deterministic ID based on source path + content hash.
    Same chunk content from the same file always produces the same ID,
    enabling Chroma to upsert rather than duplicate.
    """
    source = chunk.metadata.get("source", "unknown")
    content_hash = hashlib.md5(chunk.page_content.encode()).hexdigest()
    return f"{source}::{content_hash}"


def get_all_source_files() -> list[str]:
    files = []
    for root, _, filenames in os.walk(DATA_DIRECTORY):
        for f in filenames:
            if os.path.splitext(f)[1].lower() in SUPPORTED_EXTENSIONS:
                files.append(os.path.join(root, f))
    return files


def resolve_changes(all_files: list[str], hash_store: dict) -> tuple[list, list, dict]:
    """Compare current files against the hash store.

    Returns:
        changed_files: new or modified files that need (re-)ingestion
        deleted_files: files that were in the store but no longer exist on disk
    """
    changed = []
    current_paths = set(all_files)
    current_hashes: dict = {}

    for filepath in all_files:
        current_hash = get_file_hash(filepath)
        current_hashes[filepath] = current_hash
        if hash_store.get(filepath) != current_hash:
            changed.append(filepath)

    deleted = [p for p in list(hash_store.keys()) if p not in current_paths]

    return changed, deleted, current_hashes


def ingest(model: str = "hf"):
    """Incremental ingestion pipeline.

    - Skips files that haven't changed since the last run (saves embedding API calls)
    - Upserts changed/new files using deterministic chunk IDs (no duplicates)
    - Cleans up chunks from deleted files
    """
    logger.info("Starting ingestion process...")

    hash_store_path = os.path.join(CHROMA_PATH, model, "file_hashes.json")
    hash_store = load_hash_store(hash_store_path)
    all_files = get_all_source_files()

    if not all_files:
        logger.warning(f"No supported files found in {DATA_DIRECTORY}. Exiting.")
        return

    changed_files, deleted_files, current_hashes = resolve_changes(all_files, hash_store)
    vector_store = VectorStore(use_model=model)

    # Clean up chunks from deleted source files
    if deleted_files:
        logger.info(f"{len(deleted_files)} file(s) deleted — removing their chunks...")
        for filepath in deleted_files:
            vector_store.delete_by_source(filepath)

    if not changed_files:
        logger.info("All files are up to date. Nothing to ingest.")
        save_hash_store(hash_store, hash_store_path)
        return

    logger.info(f"{len(changed_files)} file(s) changed or new: {changed_files}")

    # Process changed files one-by-one so we can handle failures per-file
    splitter = DocumentSplitter(model)
    loader = None
    total_upserted = 0
    succeeded_files = []
    failed_files = []

    for filepath in changed_files:
        loader = DocumentLoader(file_paths=[filepath])
        documents = loader.load()
        if not documents:
            logger.warning(f"No documents produced for changed file: {filepath}. Skipping.")
            failed_files.append(filepath)
            continue

        chunks = splitter.split(documents)
        if not chunks:
            logger.warning(f"Splitter produced no chunks for: {filepath}. Skipping.")
            failed_files.append(filepath)
            continue

        ids = [
            (
                chunk.metadata.get("chunk_id")
                if chunk.metadata.get("chunk_id")
                else generate_chunk_id(chunk)
            )
            for chunk in chunks
        ]

        try:
            upserted = vector_store.add_documents(ids, None, chunks)
            total_upserted += upserted or 0
            # Only mark file as succeeded if all file chunks were upserted
            if upserted == len(chunks):
                hash_store[filepath] = current_hashes.get(filepath)
                succeeded_files.append(filepath)
            else:
                logger.error(
                    f"Partial upsert for {filepath}: expected {len(chunks)}, upserted {upserted}"
                )
                failed_files.append(filepath)
        except Exception as e:
            logger.error(f"Failed to upsert chunks for {filepath}: {e}")
            failed_files.append(filepath)

    # Persist updated hash store only for files that succeeded
    save_hash_store(hash_store, hash_store_path)

    logger.info(
        f"Ingestion finished. {total_upserted} chunks upserted. "
        f"Succeeded: {len(succeeded_files)} files. Failed: {len(failed_files)} files."
    )


if __name__ == "__main__":
    # Run using python -m app.core.ingest --model hf
    parser = argparse.ArgumentParser(description="UniPal Ingestion Script")
    parser.add_argument("--model", type=str, default="hf", choices=["hf", "gemini"])
    args = parser.parse_args()
    ingest(model=args.model)
