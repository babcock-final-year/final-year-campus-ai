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
from config import DATA_DIRECTORY

logger = get_logger(__name__)


class DocumentLoader:
    """Load files from disk and convert them into LangChain `Document` objects.

    The loader supports `.txt`, `.md`, `.csv`, and `.json` files. Files with
    unsupported extensions are skipped with a logged warning.
    """

    def __init__(self, directory: str = DATA_DIRECTORY):
        self.directory = directory

    def load(self) -> List[Document]:
        """Walk `self.directory` and load all supported documents.

        Returns:
            A list of `Document` instances. If the directory contains no
            supported files, an empty list is returned.
        """
        # Define loaders for different file types
        loaders = {
            ".txt": TextLoader,
            ".md": UnstructuredMarkdownLoader,
            ".csv": CSVLoader,
            ".json": JSONLoader,
        }

        documents = []
        for root, _, files in os.walk(self.directory):
            for file in files:
                # Determine the file extension and select the appropriate loader
                ext = os.path.splitext(file)[1].lower()
                loader_cls = loaders.get(ext)
                if loader_cls:
                    loader = loader_cls(os.path.join(root, file))
                    documents.extend(loader.load())
                else:
                    logger.warning(f"Unsupported file type: {file}")

        logger.info(f"Loaded {len(documents)} documents from {self.directory}")
        return documents