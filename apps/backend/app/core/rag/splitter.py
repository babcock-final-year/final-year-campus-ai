from langchain_core.documents import Document
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

from ...services.logger import get_logger

logger = get_logger(__name__)


class DocumentSplitter:
    """Split `Document` objects into smaller chunks suitable for embedding.

    The splitter uses a header-aware strategy for Markdown files and a
    recursive character splitter for other content types. Chunk sizes are
    adjusted based on the selected embedding model to accommodate different
    model context/embedding limits.
    """

    def __init__(self, model: str = "hf", chunk_overlap: int = 100):
        self.chunk_size = 500 if model == "hf" else 1500
        self.chunk_overlap = chunk_overlap

        self.headers_to_split_on = [("#", "Header_1"), ("##", "Header_2"), ("###", "Header_3")]

    def split(self, documents: list[Document]) -> list[Document]:
        """Return a list of smaller `Document` chunks.

        Args:
            documents: A list of `Document` instances to split.

        Returns:
            A list of `Document` chunks.
        """
        chunks = []

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            add_start_index=True,
        )

        for doc in documents:
            source_path = doc.metadata.get("source", "").lower()

            try:
                if source_path.endswith(".md"):
                    md_splitter = MarkdownHeaderTextSplitter(
                        headers_to_split_on=self.headers_to_split_on
                    )
                    header_splits = md_splitter.split_text(doc.page_content)

                    for section in header_splits:
                        # Merge metadata: doc.metadata as base, header metadata on top
                        # so header context (Header_1, Header_2 etc.) is always preserved
                        merged_metadata = {**doc.metadata, **section.metadata}
                        section.metadata.update(merged_metadata)
                        chunks.extend(text_splitter.split_documents([section]))
                else:
                    chunks.extend(text_splitter.split_documents([doc]))

            except Exception as e:
                logger.error(f"Error splitting document from {source_path}: {e}")

        logger.info(f"Split {len(documents)} documents into {len(chunks)} chunks")
        return chunks
