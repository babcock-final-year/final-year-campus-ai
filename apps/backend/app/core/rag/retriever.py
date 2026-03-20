from langchain_core.documents import Document
from langchain_core.runnables import RunnableLambda

from config import TOP_K

from ...services.logger import get_logger
from .vectorstore import VectorStore

logger = get_logger(__name__)


class Retriever:
    """Simple retriever wrapper around the project's VectorStore."""

    def __init__(self, vector_store: VectorStore | None = None, top_k: int = TOP_K):
        self.vector_store = vector_store or VectorStore()
        self.top_k = top_k

    def retrieve(self, query: str) -> list[Document]:
        """Return a list of Documents most relevant to `query`."""
        if not query:
            logger.debug("Empty query passed to retriever; returning empty list")
            return []

        try:
            return self.vector_store.search(query, K=self.top_k)
        except Exception as e:
            logger.error(f"Retriever search error: {e}")
            return []

    def __call__(self, query: str) -> list[Document]:
        return self.retrieve(query)

    def as_runnable(self) -> RunnableLambda:
        """Return an LCEL-compatible RunnableLambda for pipeline composition."""
        return RunnableLambda(self.retrieve)
