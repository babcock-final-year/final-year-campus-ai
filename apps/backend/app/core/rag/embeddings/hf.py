from langchain_core.embeddings import Embeddings
from langchain_huggingface import HuggingFaceEndpointEmbeddings

from config import HF_ACCESS_TOKEN, HF_EMBEDDINGS_MODEL


class HFEmbedding(Embeddings):
    """Hugging Face endpoint backed Embeddings wrapper.

    This class delegates embedding calls to `HuggingFaceEndpointEmbeddings`.
    """

    def __init__(self):
        self.model = HuggingFaceEndpointEmbeddings(
            model=HF_EMBEDDINGS_MODEL, huggingfacehub_api_token=HF_ACCESS_TOKEN
        )

    def embed_query(self, text: str) -> list[float]:
        return self.model.embed_query(text)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self.model.embed_documents(texts)
