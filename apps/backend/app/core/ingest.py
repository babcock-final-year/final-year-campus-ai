import os, uuid, argparse
from .rag.loader import DocumentLoader
from .rag.splitter import DocumentSplitter
from .rag.vectorstore import VectorStore
from .rag.llm import LLM
from ..services.logger import get_logger
from config import CHROMA_PATH

logger = get_logger(__name__)

def ingest(model: str = "hf"):
    """Main function to execute the ingestion pipeline: 
    loading, splitting, and vectorizing documents.

    Args:
        model: Which embedding backend to use. Expected values: 'hf' or 'gemini'.
    """

    # Confirm if vector database already exists to prevent accidental overwrites
    if os.path.exists(CHROMA_PATH):
        logger.warning(f"Vector store directory already exists at {CHROMA_PATH}. Ingestion will proceed and may overwrite existing data.")

    logger.info("Starting ingestion process...")

    # Step 1: Load documents
    loader = DocumentLoader()
    documents = loader.load()

    if not documents:
        logger.warning("No documents loaded. Ingestion process will exit.")
        return
    
    # Step 2: Split documents (respect chosen model)
    splitter = DocumentSplitter(model)
    chunks = splitter.split(documents)

    # Step 3: Add chunks to vector store
    ids = [str(uuid.uuid4()) for _ in range(len(chunks))]  # Generate unique IDs for each chunk

    vector_store = VectorStore(use_model=model)
    vector_store.add_documents(ids, None, chunks)

    logger.info(f"Ingestion process completed successfully. {len(chunks)} chunks added to vector store (model={model}).")


if __name__ == "__main__":
    # Run using python -m app.core.ingest --model hf
    parser = argparse.ArgumentParser(description="Unipal Ingestion Script")
    parser.add_argument(
        "--model",
        type=str,
        default="hf",
        choices=["hf", "gemini"],
        help="The embedding model to use (hf or gemini)."
    )
    args = parser.parse_args()
    ingest(model=args.model)