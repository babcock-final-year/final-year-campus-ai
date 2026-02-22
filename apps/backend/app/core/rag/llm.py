import os
from typing import List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.callbacks import BaseCallbackHandler
from ...services.logger import get_logger
from config import GEMINI_LLM_MODEL, GEMINI_API_KEY, GROQ_LLM_MODEL, GROQ_API_KEY, PROMPT_PATH

logger = get_logger(__name__)

# os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY
# os.environ["GROQ_API_KEY"] = GROQ_API_KEY
# os.environ["GOOGLE_MODEL_NAME"] = GEMINI_LLM_MODEL
# os.environ["GROQ_LLM_MODEL"] = GROQ_LLM_MODEL

class FallbackLoggingHandler(BaseCallbackHandler):
    """Custom handler to log when the primary LLM fails and fallback triggers."""

    def on_llm_error(self, error, **kwargs):
        logger.error(f"Primary LLM error: {error}. Triggering fallback to Groq LLM.")


class LLM:
    """Wrapper around the project's chat LLM(s) with a simple fallback.

    This class exposes `get_response(query, retriever)` which composes an LCEL
    pipeline: (retriever -> format docs -> prompt -> llm_chain -> parser).
    """

    def __init__(self):
        self.prompt_path = PROMPT_PATH

        # Primary LLM (Gemini)
        self.primary_llm = ChatGoogleGenerativeAI(
            model=GEMINI_LLM_MODEL,
            api_key=GEMINI_API_KEY,
            temperature=0.2,
            max_retries=1,
        )

        # Fallback LLM (Groq)
        self.fallback_llm = ChatGroq(model_name=GROQ_LLM_MODEL, api_key=GROQ_API_KEY, temperature=0.2)

        # Chain
        self.llm_chain = self.primary_llm.with_fallbacks([self.fallback_llm]).with_config(
            callbacks=[FallbackLoggingHandler()]
        )

    def _get_prompt_template(self) -> PromptTemplate:
        """Load the prompt template from the configured `PROMPT_PATH`.

        Falls back to a minimal template when file loading fails.
        """
        try:
            return PromptTemplate.from_file(self.prompt_path)
        except Exception as e:
            logger.error(f"Error loading prompt template from {self.prompt_path}: {str(e)}")
            # Fallback hardcoded prompt if file loading fails
            return PromptTemplate.from_template("Context: {context}\n\nQuestion: {question}\n\n")

    def _format_docs(self, docs: List[str]) -> str:
        """Merge retrieved Document chunks into a single string for the prompt."""
        return "\n\n".join(doc.page_content for doc in docs)

    def get_response(self, query: str, retriever) -> str:
        """Execute the RAG chain and return a text response from the LLM.

        Args:
            query: The user question.
            retriever: A runnable or callable that accepts the query and returns
                       a list of `Document` objects.

        Returns:
            A string response from the LLM. On failure, a friendly error
            message is returned and the exception is logged.
        """

        prompt = self._get_prompt_template()

        # Define the LCEL Chain
        rag_chain = (
            {"context": retriever | self._format_docs, "query": RunnablePassthrough()}
            | prompt
            | self.llm_chain
            | StrOutputParser()
        )

        try:
            return rag_chain.invoke(query)
        except Exception as e:
            logger.critical(f"All LLM paths failed: {e}")
            return "I'm sorry, an error occurred. Please try again later."