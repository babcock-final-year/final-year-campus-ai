import os
from typing import List, Optional
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_core.runnables import RunnablePassthrough
from .embeddings.gemini import GeminiEmbedding
from .embeddings.hf import HFEmbedding
from ...services.logger import get_logger
from config import CHROMA_PATH, TOP_K

logger = get_logger(__name__)

class VectorStore:
    """Wrapper around a Chroma persistence layer.

    This class handles initialization of a Chroma collection and provides
    convenience helpers for adding documents and searching. For testing or
    specialised embedding workflows you can pass a custom `embeddings` object
    that implements the LangChain `Embeddings` interface.
    """

    def __init__(
        self,
        persist_directory: str = CHROMA_PATH,
        use_model: str = "hf",
        embeddings: Optional[Embeddings] = None,
    ):
        self.persist_directory = os.path.join(persist_directory, use_model)
        # Allow injection of a custom embeddings instance (useful for tests)
        if embeddings is not None:
            self.embeddings = embeddings
        else:
            self.embeddings = HFEmbedding() if use_model == "hf" else GeminiEmbedding()

        self.vector_store = None

    def initialize_db(self):
        """Create the persistence directory (if needed) and initialize Chroma.

        This method is idempotent and logs any initialization errors instead of
        raising them to avoid crashing long-running ingestion jobs.
        """
        if not os.path.exists(self.persist_directory):
            os.makedirs(self.persist_directory)
            logger.info(f"Created vector store directory at {self.persist_directory}")
        else:
            logger.info(f"Vector store directory already exists at {self.persist_directory}")

        try:
            self.vector_store = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings,
                collection_name="unipal_knowledge_base",
            )
            logger.info(f"Initialized Chroma vector store successfully at {self.persist_directory}")
        except Exception as e:
            logger.error(f"Error initializing Chroma vector store: {str(e)}")

    def add_documents(self, id, metadata, documents: List[Document]):
        """Add a list of `Document` chunks to the underlying vector store.

        Parameters:
        - id: list of ids for each document
        - metadata: list of metadata dictionaries or None
        - documents: list of `Document` objects

        The function performs batching (100 documents per batch) to respect
        embedding and upstream API limits.
        """
        if metadata is None:
            metadata = [{} for _ in range(len(documents))]

        # Gemini batch limit (and a sensible default) is 100.
        batch_size = 100

        if not self.vector_store:
            self.initialize_db()

        try:
            for i in range(0, len(documents), batch_size):
                batch_docs = documents[i : i + batch_size]
                batch_ids = id[i : i + batch_size]
                batch_metadata = metadata[i : i + batch_size]

                texts = [doc.page_content for doc in batch_docs]
                # Chroma's add_texts expects texts, metadatas and ids
                self.vector_store.add_texts(texts=texts, metadatas=batch_metadata, ids=batch_ids)

            logger.info(f"Added {len(documents)} documents to vector store successfully")
        except Exception as e:
            logger.error(f"Error adding documents to vector store: {str(e)}")

    def search(self, query: str, K: int = TOP_K) -> List[Document]:
        """Search the vector store for relevant `Document` chunks.

        The method is defensive: it supports different retriever interfaces that
        Chroma or the higher-level LangChain runtime may expose.
        """
        if not self.vector_store:
            logger.warning("Vector store not initialized. Returning empty results.")
            return []

        try:
            retriever = self.vector_store.as_retriever(search_kwargs={"k": K})

            # Support multiple retriever interfaces for robustness
            if hasattr(retriever, "get_relevant_documents"):
                results = retriever.get_relevant_documents(query)
            elif hasattr(retriever, "invoke"):
                results = retriever.invoke(query)
            elif callable(retriever):
                results = retriever(query)
            else:
                logger.error("Retriever does not expose a callable interface")
                return []

            logger.info(f"Found {len(results)} results for query '{query}'")
            return results
        except Exception as e:
            logger.error(f"Error searching vector store: {str(e)}")
            return []

    def get_retriever(self) -> RunnablePassthrough:
        """Return an LCEL-compatible `RunnablePassthrough` wrapping `search`.

        This convenience method allows direct composition into LCEL pipelines
        such as those created in `LLM.get_response`.
        """
        return RunnablePassthrough(self.search)