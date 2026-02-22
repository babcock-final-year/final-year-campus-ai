"""Simple Gradio demo for testing the RAG pipeline.

Run: python services/demo.py

The demo attempts to import the project's RAG components (`VectorStore`,
`Retriever`, `LLM`) and falls back to friendly error messages if dependencies
or credentials are missing.
"""

import traceback
from typing import List, Tuple

import gradio as gr

try:
    from app.core.rag.vectorstore import VectorStore
    from app.core.rag.retriever import Retriever
    from app.core.rag.llm import LLM
    RAG_AVAILABLE = True
except Exception as e:
    RAG_AVAILABLE = False
    RAG_IMPORT_ERROR = traceback.format_exc()


def init_components(model_choice: str):
    """Initialize VectorStore, Retriever and LLM.

    Returns (retriever_runnable, llm_instance, error_message)
    """
    if not RAG_AVAILABLE:
        return None, None, "RAG components not importable.\n" + RAG_IMPORT_ERROR

    try:
        vs = VectorStore(use_model=model_choice)
        retriever = Retriever(vector_store=vs)
        llm = LLM()
        return retriever.as_runnable(), llm, None
    except Exception as e:
        return None, None, f"Error initializing RAG components: {e}\n" + traceback.format_exc()


def handle_user(message: str, history: List[Tuple[str, str]], model_choice: str):
    """Process a user message and return updated history.

    - Initializes the components lazily per-call so you can switch `model_choice`.
    - Shows helpful errors if something goes wrong.
    """
    if not message.strip():
        return history + [("System", "Please type a message.")]

    retriever_runnable, llm, err = init_components(model_choice)
    if err:
        return history + [("System", err)]

    history = history or []
    history.append(("User", message))

    try:
        # LLM expects a retriever-like runnable in get_response
        response = llm.get_response(message, retriever_runnable)
    except Exception as e:
        resp = f"LLM call failed: {e}\n" + traceback.format_exc()
        history.append(("System", resp))
        return history

    history.append(("Assistant", response))
    return history


def reset_chat():
    return []


def build_demo():
    with gr.Blocks(title="RAG Demo", theme=gr.themes.Default()) as demo:
        gr.Markdown(
            "# RAG Demo Chat\n\nQuick Gradio interface to test the RAG pipeline (retrieval + LLM)."
        )

        with gr.Row():
            with gr.Column(scale=3):
                chatbot = gr.Chatbot(label="RAG Assistant")
                msg = gr.Textbox(label="Message", placeholder="Ask a question about the docs...")
                with gr.Row():
                    send = gr.Button("Send")
                    clear = gr.Button("Clear")
            with gr.Column(scale=1):
                model_choice = gr.Radio(value="hf", choices=["hf", "gemini"], label="Embeddings Model")
                gr.Markdown("""
                **Instructions**\n
                - Choose an embedding backend (HF or Gemini) if available.\n
                - Type a question and press Send.\n
                - If components fail to initialize, check the server logs and
                  ensure credentials are set in your environment.
                """)

        examples = [
            "How do I apply for admission?",
            "Where can I find campus events?",
            "Summarize the facilities available to students."
        ]

        for ex in examples:
            gr.Examples([ex], inputs=msg, fn=None, examples_per_page=3)

        def send_click(m, history, model):
            return handle_user(m, history, model)

        send.click(fn=send_click, inputs=[msg, chatbot, model_choice], outputs=chatbot)
        msg.submit(fn=send_click, inputs=[msg, chatbot, model_choice], outputs=chatbot)
        clear.click(fn=reset_chat, inputs=None, outputs=chatbot)

    return demo


if __name__ == "__main__":
    demo = build_demo()
    print("Starting RAG demo. If components fail to initialize you will see a helpful message in the UI.")
    demo.launch(share=False)
