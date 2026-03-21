from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from spectree import Response

from app import db, spec

from ..core.rag.llm import LLM
from ..core.rag.retriever import Retriever
from ..core.rag.vectorstore import VectorStore
from ..models import Chat, Message, User
from ..schemas import ChatHistoryResponse, ChatMessageRequest, ChatMessageResponse
from ..services.logger import get_logger
from . import api
from .decorators import member_required
from .errors import abort_forbidden, abort_not_found

logger = get_logger(__name__)


@api.route("/chat", methods=["POST"])
@jwt_required()
def create_chat():
    """Create a new chat for the current user.

    Request JSON (optional): {"title": "My chat title"}
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        abort_not_found("User not found")

    data = request.get_json(silent=True) or {}
    title = data.get("title") or "New Conversation"

    chat = Chat(user_id=user.id, title=title)
    db.session.add(chat)
    db.session.commit()

    logger.info(f"Chat created: {chat.id} for user {user.id}")
    return jsonify({"chat_id": chat.id, "title": chat.title}), 201


@api.route("/chat/<chat_id>", methods=["GET"])
@jwt_required()
@member_required(check_owner=True, owner_arg="user_id")
def get_chat_history(chat_id, current_user=None):
    """Return the chat history for a chat id. Only owner may fetch."""
    chat = Chat.query.get(chat_id)
    if not chat:
        abort_not_found("Chat not found")

    # Ensure owner
    if chat.user_id != current_user.id:
        abort_forbidden("You are not allowed to view this chat")

    messages = Message.query.filter_by(chat_id=chat.id).order_by(Message.timestamp.asc()).all()
    resp_msgs = [ChatMessageResponse.model_validate(m).model_dump() for m in messages]

    resp = ChatHistoryResponse(chat_id=chat.id, title=chat.title, messages=resp_msgs)
    return jsonify(resp.model_dump()), 200


@api.route("/chat/<chat_id>/message", methods=["POST"])
@spec.validate(json=ChatMessageRequest, resp=Response(HTTP_200=ChatMessageResponse))
@jwt_required()
def post_message(chat_id, current_user=None):
    """User posts a message to a chat. The server runs the RAG LLM to
    generate an assistant response and stores both messages.
    """
    # Resolve current user from JWT (allow guests/non-members to post)
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        abort_not_found("User not found")

    chat = Chat.query.get(chat_id)
    if not chat:
        abort_not_found("Chat not found")

    # Only the chat owner may post to this chat
    if chat.user_id != user.id:
        abort_forbidden("You are not allowed to modify this chat")

    data = request.context.json
    content = data.content

    # Save user message
    user_msg = Message(chat_id=chat.id, role="user", content=content)
    db.session.add(user_msg)
    db.session.commit()

    # Initialize RAG components (use default model 'hf')
    try:
        vs = VectorStore(use_model="hf")
        retriever = Retriever(vector_store=vs)
        llm = LLM()

        retriever_runnable = retriever.as_runnable()

        assistant_text = llm.get_response(content, retriever_runnable)
    except Exception as e:
        logger.error(f"RAG generation failed: {e}")
        assistant_text = "Sorry, I couldn't generate a response right now."

    # Save assistant message
    assistant_msg = Message(chat_id=chat.id, role="assistant", content=assistant_text)
    db.session.add(assistant_msg)
    db.session.commit()

    resp = ChatMessageResponse.model_validate(assistant_msg).model_dump()
    return jsonify(resp), 201


@api.route("/chat/<chat_id>", methods=["DELETE"])
@jwt_required()
def delete_chat(chat_id):
    """Delete a chat and its messages. Only the chat owner may delete."""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        abort_not_found("User not found")

    chat = Chat.query.get(chat_id)
    if not chat:
        abort_not_found("Chat not found")

    if chat.user_id != user.id:
        abort_forbidden("You are not allowed to delete this chat")

    db.session.delete(chat)
    db.session.commit()
    logger.info(f"Deleted chat {chat_id} for user {user.id}")
    return jsonify({"message": "Chat deleted"}), 200
