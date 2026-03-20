import chainlit as cl

# Run using chainlit run app/services/chainlit_demo.py

try:
    from app.core.rag.llm import LLM
    from app.core.rag.retriever import Retriever
    from app.core.rag.vectorstore import VectorStore

    RAG_AVAILABLE = True
except Exception as e:
    RAG_AVAILABLE = False
    RAG_IMPORT_ERROR = str(e)

# Default model — user can switch via settings
DEFAULT_MODEL = "hf"


def init_components(model_choice: str):
    if not RAG_AVAILABLE:
        return None, None, f"RAG components not importable: {RAG_IMPORT_ERROR}"
    try:
        vs = VectorStore(use_model=model_choice)
        retriever = Retriever(vector_store=vs)
        llm = LLM()
        return retriever.as_runnable(), llm, None
    except Exception as e:
        return None, None, f"Error initializing RAG components: {e}"


@cl.set_chat_profiles
async def chat_profiles():
    """Embedding model selector shown at the start of each session."""
    return [
        cl.ChatProfile(
            name="HuggingFace",
            markdown_description="Uses the **HuggingFace** local embedding model. Free, no API limits.",
            icon="https://huggingface.co/front/assets/huggingface_logo-noborder.svg",
        ),
        cl.ChatProfile(
            name="Gemini",
            markdown_description="Uses **Google Gemini** embeddings. Requires a valid API key.",
            icon="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg",
        ),
    ]


@cl.on_chat_start
async def on_start():
    """Run when a new chat session begins."""
    profile = cl.user_session.get("chat_profile")
    model = "gemini" if profile == "Gemini" else "hf"
    cl.user_session.set("model", model)

    actions = [
        cl.Action(
            name="admission", payload={"value": "How do I apply for admission?"}, label="Admissions"
        ),
        cl.Action(name="fees", payload={"value": "What are the tuition fees?"}, label="Fees"),
        cl.Action(
            name="curfew", payload={"value": "What is the curfew time?"}, label="Campus Rules"
        ),
        cl.Action(
            name="grading",
            payload={"value": "How does the grading system work?"},
            label="Academics",
        ),
    ]

    await cl.Message(
        content=(
            "## Welcome to UniPal\n"
            "Your AI-powered assistant for **Babcock University**.\n\n"
            "Ask me anything about admissions, fees, campus life, "
            "rules, events, or academics.\n\n"
            "**Try asking:**\n"
            "- How do I apply for admission at Babcock?\n"
            "- What is the curfew time?\n"
            "- How does the grading system work?\n"
            "- What are the Engineering fees?\n"
            "- Tell me about hostel accommodation."
        ),
        actions=actions,
        author="UniPal",
    ).send()


async def handle_message_text(text: str):
    model = cl.user_session.get("model", DEFAULT_MODEL)
    retriever_runnable, llm, err = init_components(model)
    msg = cl.Message(content="", author="UniPal")
    await msg.send()
    full_response = llm.get_response(text, retriever_runnable)
    for char in full_response:
        await msg.stream_token(char)
    await msg.update()


@cl.action_callback("admission")
async def on_admission(action: cl.Action):
    await handle_message_text(action.payload["value"])


@cl.action_callback("fees")
async def on_fees(action: cl.Action):
    await handle_message_text(action.payload["value"])


@cl.action_callback("curfew")
async def on_curfew(action: cl.Action):
    await handle_message_text(action.payload["value"])


@cl.action_callback("grading")
async def on_grading(action: cl.Action):
    await handle_message_text(action.payload["value"])


@cl.on_message
async def on_message(message: cl.Message):
    """Handle every incoming user message."""
    model = cl.user_session.get("model", DEFAULT_MODEL)

    retriever_runnable, llm, err = init_components(model)

    if err:
        await cl.Message(content=f"Error: {err}", author="UniPal").send()
        return

    # Show a thinking indicator
    msg = cl.Message(content="", author="UniPal")
    await msg.send()

    try:
        full_response = llm.get_response(message.content, retriever_runnable)

        # Stream character by character
        for char in full_response:
            await msg.stream_token(char)

        await msg.update()

    except Exception as e:
        msg.content = f"Sorry, something went wrong: {e}"
        await msg.update()
