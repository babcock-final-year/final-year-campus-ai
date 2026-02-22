from typing import List
from langchain_core.embeddings import Embeddings
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from config import HF_EMBEDDINGS_MODEL, HF_ACCESS_TOKEN


class HFEmbedding(Embeddings):
    """Hugging Face endpoint backed Embeddings wrapper.

    This class delegates embedding calls to `HuggingFaceEndpointEmbeddings`.
    """

    def __init__(self):
        self.model = HuggingFaceEndpointEmbeddings(model=HF_EMBEDDINGS_MODEL, huggingfacehub_api_token=HF_ACCESS_TOKEN)

    def embed_query(self, text: str) -> List[float]:
        return self.model.embed_query(text)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self.model.embed_documents(texts)
    