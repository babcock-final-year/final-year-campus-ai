import os

from langchain_community.document_loaders import TextLoader
from langchain_core.documents import Document

from config import DATA_DIRECTORY

from ...services.logger import get_logger

logger = get_logger(__name__)


class DocumentLoader:
    """Load files from disk and convert them into LangChain Document objects.

    Supports .txt, .md, .csv, and .json files. Can load from a full directory
    or from a specific list of file paths (used by incremental ingestion).
    """

    def __init__(
        self,
        directory: str = DATA_DIRECTORY,
        file_paths: list[str] | None = None,
    ):
        self.directory = directory
        self.file_paths = file_paths  # if provided, skip directory walk

    def _get_file_list(self) -> list[str]:
        """Return the list of files to load — either explicit or from directory walk."""
        if self.file_paths is not None:
            return self.file_paths

        all_files = []
        for root, _, files in os.walk(self.directory):
            for file in files:
                all_files.append(os.path.join(root, file))
        return all_files

    def _load_file(self, filepath: str) -> list[Document]:
        """Load a single file using the appropriate loader."""
        ext = os.path.splitext(filepath)[1].lower()

        try:
            if ext == ".txt":
                loader = TextLoader(filepath, encoding="utf-8")
                docs = loader.load()

            elif ext == ".md":
                with open(filepath, encoding="utf-8") as f:
                    content = f.read()
                docs = [Document(page_content=content, metadata={"source": filepath})]

            elif ext == ".csv":
                import csv

                for encoding in ["utf-8-sig", "latin-1"]:
                    try:
                        with open(filepath, encoding=encoding) as f:
                            reader = csv.DictReader(f)
                            rows = list(reader)
                        break
                    except UnicodeDecodeError:
                        continue
                docs = [
                    Document(
                        page_content=", ".join(f"{k}: {v}" for k, v in row.items()),
                        metadata={"source": filepath},
                    )
                    for row in rows
                    if any(row.values())
                ]

            elif ext == ".json":
                import json

                with open(filepath, encoding="utf-8") as f:
                    data = json.load(f)
                docs = [
                    Document(page_content=json.dumps(data, indent=2), metadata={"source": filepath})
                ]

            else:
                logger.warning(f"Unsupported file type, skipping: {filepath}")
                return []

            # Ensure source metadata is always set
            for doc in docs:
                doc.metadata["source"] = filepath

            return docs

        except Exception as e:
            logger.error(f"Failed to load {filepath}: {e}")
            return []

    def load(self) -> list[Document]:
        """Load all target files and return a flat list of Documents."""
        files = self._get_file_list()
        documents = []

        for filepath in files:
            docs = self._load_file(filepath)
            documents.extend(docs)

        logger.info(f"Loaded {len(documents)} documents from {len(files)} file(s)")
        return documents
