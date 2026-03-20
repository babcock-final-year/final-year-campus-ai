import os
import time

from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings

from config import CHROMA_PATH, TOP_K

from ...services.logger import get_logger
from .embeddings.gemini import GeminiEmbedding
from .embeddings.hf import HFEmbedding

logger = get_logger(__name__)


class VectorStore:
    """Wrapper around a Chroma persistence layer."""

    def __init__(
        self,
        persist_directory: str = CHROMA_PATH,
        use_model: str = "hf",
        embeddings: Embeddings | None = None,
    ):
        self.model = use_model
        self.persist_directory = os.path.join(persist_directory, use_model)
        self.embeddings = embeddings or (HFEmbedding() if self.model == "hf" else GeminiEmbedding())
        self.vector_store = None

    def initialize_db(self):
        """Create the persistence directory (if needed) and initialize Chroma."""
        os.makedirs(self.persist_directory, exist_ok=True)
        logger.info(f"Vector store directory ready at {self.persist_directory}")

        try:
            self.vector_store = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings,
                collection_name="unipal_knowledge_base",
            )
            logger.info("Initialized Chroma vector store successfully")
        except Exception as e:
            logger.error(f"Error initializing Chroma vector store: {e}")

    def _ensure_initialized(self):
        """Initialize the DB if not already done."""
        if not self.vector_store:
            self.initialize_db()

    def add_documents(self, ids: list[str], metadata: list[dict] | None, documents: list[Document]):
        """Upsert document chunks into Chroma with deterministic IDs.

        Uses add_documents (not add_texts) so that chunk metadata — including
        the source filepath — is preserved in the vector store.
        """
        self._ensure_initialized()

        # Merge any extra metadata passed in with what's already on the document
        if metadata:
            for doc, meta in zip(documents, metadata, strict=False):
                doc.metadata.update(meta)

        batch_size = 100
        upserted = 0
        for i in range(0, len(documents), batch_size):
            batch_docs = documents[i : i + batch_size]
            batch_ids = ids[i : i + batch_size]

            try:
                self.vector_store.add_documents(documents=batch_docs, ids=batch_ids)
            except Exception as e:
                logger.error(
                    f"Error adding documents to vector store on batch {i // batch_size + 1}: {e}"
                )
                # Reraise so callers can decide how to handle partial failures
                raise

            upserted += len(batch_docs)

            # Rate-limit buffer for Gemini
            if self.model == "gemini" and i + batch_size < len(documents):
                logger.info(
                    f"Upserted batch {i // batch_size + 1} of {(len(documents) + batch_size - 1) // batch_size}"
                )
                logger.info("Sleeping for 10 seconds to respect Gemini rate limits...")
                time.sleep(10)  # Sleep for 10 seconds after each batch when using Gemini

        logger.info(f"Upserted {upserted} chunks into vector store")
        return upserted

    def delete_by_source(self, source: str):
        """Delete all chunks belonging to a specific source file."""
        self._ensure_initialized()
        try:
            results = self.vector_store.get(where={"source": source})
            ids_to_delete = results.get("ids", [])
            if ids_to_delete:
                self.vector_store.delete(ids=ids_to_delete)
                logger.info(f"Deleted {len(ids_to_delete)} chunks for source: {source}")
            else:
                logger.info(f"No chunks found for source: {source}")
        except Exception as e:
            logger.error(f"Error deleting chunks for source {source}: {e}")

    def search(self, query: str, K: int = TOP_K) -> list[Document]:
        """Search the vector store for the most relevant chunks."""
        self._ensure_initialized()
        try:
            retriever = self.vector_store.as_retriever(search_kwargs={"k": K})
            results = retriever.invoke(query)
            logger.info(f"Found {len(results)} results for query: '{query}'")
            return results
        except Exception as e:
            logger.error(f"Error searching vector store: {e}")
            return []

    def get_retriever(self):
        """Return an LCEL-compatible retriever for use in RAG chains."""
        self._ensure_initialized()
        return self.vector_store.as_retriever(search_kwargs={"k": TOP_K})
