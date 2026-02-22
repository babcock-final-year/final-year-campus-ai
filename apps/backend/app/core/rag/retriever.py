from typing import List, Optional
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document
from .vectorstore import VectorStore
from config import TOP_K
from ...services.logger import get_logger

logger = get_logger(__name__)


class Retriever:
    """Simple retriever wrapper around the project's VectorStore.

    Usage:
    - Create with `retriever = Retriever(VectorStore(use_model='hf'))`
    - Call `retriever.retrieve(query)` to get a list of `Document` objects.
    - Use `retriever.as_runnable()` to obtain a `RunnablePassthrough` you can
      compose into the LCEL pipeline (e.g., in `LLM.get_response`).
    """

    def __init__(self, vector_store: Optional[VectorStore] = None, top_k: int = TOP_K):
        self.vector_store = vector_store or VectorStore()
        self.top_k = top_k

    def retrieve(self, query: str) -> List[Document]:
        """Return a list of Documents most relevant to `query`.

        This delegates to `VectorStore.search` and returns whatever
        that method yields (empty list on errors).
        """
        if not query:
            logger.debug("Empty query passed to retriever; returning empty list")
            return []

        try:
            results = self.vector_store.search(query, K=self.top_k) if self.top_k else self.vector_store.search(query)
            return results
        except Exception as e:
            logger.error(f"Retriever search error: {e}")
            return []

    def __call__(self, query: str) -> List[Document]:
        return self.retrieve(query)

    def as_runnable(self) -> RunnablePassthrough:
        """Return a `RunnablePassthrough` wrapping the retriever for LCEL composition."""
        return RunnablePassthrough(self.retrieve)
