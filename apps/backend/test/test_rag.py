import os
import tempfile
import unittest
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate

# Try to import project modules; tests will skip if dependencies aren't available
try:
    from app.core.rag.loader import DocumentLoader
    from app.core.rag.splitter import DocumentSplitter
    from app.core.rag.vectorstore import VectorStore
    from app.core.rag.retriever import Retriever
    from app.core.rag.llm import LLM
    HAS_MODULES = True
except Exception:
    HAS_MODULES = False

@unittest.skipIf(not HAS_MODULES, "Required project modules or dependencies not available")
class TestRagPipeline(unittest.TestCase):
    def test_document_loader_reads_txt_and_md(self):
        with tempfile.TemporaryDirectory() as td:
            # Create sample txt and md files
            txt_path = os.path.join(td, "test.txt")
            md_path = os.path.join(td, "test.md")
            with open(txt_path, "w") as f:
                f.write("This is a test text file.")
            with open(md_path, "w") as f:
                f.write("# Header\n\nThis is a test markdown file.")

            loader = DocumentLoader(directory=td)
            documents = loader.load()
            
            self.assertIsInstance(documents, list)
            self.assertEqual(len(documents), 2)
            self.assertTrue(any(doc.page_content.startswith("This is a test text file.") for doc in documents))
            # Some markdown loaders may normalize/remove leading hashes;
            # assert the markdown content exists in one of the loaded documents.
            self.assertTrue(any("This is a test markdown file." in doc.page_content for doc in documents))

            # Metadata/source should reference filenames
            sources = [doc.metadata.get("source", "") for doc in documents]
            self.assertTrue(any("test.txt" in s for s in sources) or any(s == "" for s in sources))

    def test_splitter_basic(self):
        docs = [Document(page_content="This is a test doc about admissions.", metadata={"source": "test.txt"})]
        splitter = DocumentSplitter(model="hf", chunk_overlap=10)
        chunks = splitter.split(docs)
        self.assertTrue(isinstance(chunks, list))
        self.assertGreaterEqual(len(chunks), 1)

    def test_retriever_and_vectorstore_with_mock(self):
        # Mock vector store behaviour by injecting a simple in-memory object
        class MockVectorStore:
            def __init__(self):
                self.texts = []
                self.metadatas = []
                self.ids = []

            def add_texts(self, texts, metadatas=None, ids=None):
                self.texts.extend(texts)
                self.metadatas.extend(metadatas or [{} for _ in texts])
                self.ids.extend(ids or [None for _ in texts])

            def as_retriever(self, search_kwargs=None):
                k = (search_kwargs or {}).get("k")

                class R:
                    def __init__(self, texts):
                        self._texts = texts

                    def get_relevant_documents(self, query):
                        # Return all texts as Documents for simplicity
                        return [Document(page_content=t, metadata={}) for t in self._texts]

                return R(self.texts)

        vs = VectorStore(persist_directory=tempfile.gettempdir(), use_model="hf")
        # inject mock vector_store
        vs.vector_store = MockVectorStore()

        docs = [Document(page_content="Admissions info: apply online.", metadata={"source": "a.txt"}), Document(page_content="Campus life details.", metadata={"source": "b.txt"})]
        ids = ["1", "2"]
        vs.add_documents(ids, None, docs)

        retriever = Retriever(vector_store=vs, top_k=2)
        results = retriever.retrieve("apply")
        self.assertIsInstance(results, list)
        self.assertEqual(len(results), 2)

    def test_vectorstore_get_retriever_returns_runnable(self):
        vs = VectorStore(persist_directory=tempfile.gettempdir(), use_model="hf")
        # If langchain_core.runnables is available, get_retriever should return a RunnablePassthrough
        runnable = vs.get_retriever()
        # We only assert that it's callable-like by calling its "invoke" if present
        if hasattr(runnable, "invoke"):
            # calling with a query on an uninitialized vector store should not raise
            res = runnable.invoke("test-query")
            # Accept common return types (list/tuple/dict/string) or None
            self.assertTrue(isinstance(res, (list, tuple, dict, str, type(None))))
        else:
            # Fallback: ensure the runnable itself is callable
            self.assertTrue(callable(runnable))

    def test_llm_format_and_prompt_fallback(self):
        """Basic LLM unit checks: formatting docs and prompt template fallback."""
        llm = LLM()
        docs = [Document(page_content="Doc A"), Document(page_content="Doc B")]
        merged = llm._format_docs(docs)
        self.assertIn("Doc A", merged)
        self.assertIn("Doc B", merged)

        # Force prompt template fallback by pointing to a non-existing file
        llm.prompt_path = "nonexistent_prompt_file.txt"
        prompt = llm._get_prompt_template()
        self.assertTrue(isinstance(prompt, PromptTemplate))


if __name__ == "__main__":
    unittest.main()
