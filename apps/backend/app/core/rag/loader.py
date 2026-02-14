import os
from typing import List
from langchain_community.document_loaders import (
    TextLoader,
    UnstructuredMarkdownLoader,
    CSVLoader,
    JSONLoader,
)
from langchain_core.documents import Document
from ...services.logger import get_logger

logger = get_logger(__name__)

class DocumentLoader:
    def __init__(self, directory: str):
        self.directory = directory

    def load(self) -> List[Document]:

        # Define loaders for different file types
        loaders = {
            '.txt': TextLoader,
            '.md': UnstructuredMarkdownLoader,
            '.csv': CSVLoader,
            '.json': JSONLoader,
        }

        documents = []
        for root, _, files in os.walk(self.directory):
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                loader_cls = loaders.get(ext)
                if loader_cls:
                    loader = loader_cls(os.path.join(root, file))
                    documents.extend(loader.load())
                else:
                    logger.warning(f"Unsupported file type: {file}")
        
        return documents