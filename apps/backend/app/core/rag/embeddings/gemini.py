from typing import List
from langchain_core.embeddings import Embeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from config import GEMINI_API_KEY, GEMINI_EMBEDDINGS_MODEL

class GeminiEmbedding(Embeddings):
    """Gemini (Google) embedding wrapper.

    Delegates to `GoogleGenerativeAIEmbeddings` with the `retrieval_document`
    task type.
    """

    def __init__(self):
        self.model = GoogleGenerativeAIEmbeddings(model=GEMINI_EMBEDDINGS_MODEL, api_key=GEMINI_API_KEY, task_type="retrieval_document")

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self.model.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        """Embed a single query for searching."""
        return self.model.embed_query(text)