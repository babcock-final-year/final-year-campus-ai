from flask import jsonify, request
from spectree import Response

from app import db, spec

from ..models import Chat, Message
from ..schemas import (
    ChatHistoryResponse,
    ChatMessageResponse,
    ChatsListResponse,
    DeleteResponse,
    LikeMessageRequest,
    SearchResponse,
)
from ..services.logger import get_logger
from . import api
from .decorators import member_required
from .errors import abort_bad_request, abort_forbidden, abort_not_found

logger = get_logger(__name__)


@api.route("/history/chats", methods=["GET"])
@spec.validate(resp=Response(HTTP_200=ChatsListResponse))
@member_required(check_owner=False)
def list_chats(current_user=None):
    """List all chats for the current user."""
    # current_user is attached by the decorator
    chats = Chat.query.filter_by(user_id=current_user.id).order_by(Chat.created_at.desc()).all()
    out = [
        {
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in chats
    ]
    return jsonify({"chats": out}), 200


@api.route("/history/chats", methods=["DELETE"])
@spec.validate(resp=Response(HTTP_200=DeleteResponse))
@member_required(check_owner=False)
def clear_all_chats(current_user=None):
    """Delete all chats and messages for the current user."""
    chats = Chat.query.filter_by(user_id=current_user.id).all()
    if not chats:
        return jsonify({"message": "No chats to delete"}), 200

    for c in chats:
        db.session.delete(c)

    db.session.commit()
    logger.info(f"Cleared all chats for user {current_user.id}")
    return jsonify({"message": "All chats deleted"}), 200


@api.route("/history/chat/<chat_id>/messages", methods=["GET"])
@spec.validate(resp=Response(HTTP_200=ChatHistoryResponse))
@member_required(check_owner=False)
def get_messages(chat_id, current_user=None):
    """Return messages for a chat. Owner only."""
    chat = Chat.query.get(chat_id)
    if not chat:
        abort_not_found("Chat not found")

    if chat.user_id != current_user.id:
        abort_forbidden("You are not allowed to view this chat")

    messages = Message.query.filter_by(chat_id=chat.id).order_by(Message.timestamp.asc()).all()
    resp_msgs = []
    for m in messages:
        jm = {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "timestamp": None,
            "is_liked": m.is_liked,
        }
        if getattr(m, "timestamp", None) is not None:
            try:
                jm["timestamp"] = m.timestamp.isoformat()
            except Exception:
                jm["timestamp"] = str(m.timestamp)
        resp_msgs.append(jm)

    resp = {
        "chat_id": chat.id,
        "title": chat.title,
        "messages": resp_msgs,
    }
    return jsonify(resp), 200


@api.route("/history/chat/<chat_id>", methods=["DELETE"])
@spec.validate(resp=Response(HTTP_200=DeleteResponse))
@member_required(check_owner=False)
def delete_chat(chat_id, current_user=None):
    """Delete a specific chat and its messages. Owner only."""
    chat = Chat.query.get(chat_id)
    if not chat:
        abort_not_found("Chat not found")

    if chat.user_id != current_user.id:
        abort_forbidden("You are not allowed to delete this chat")

    db.session.delete(chat)
    db.session.commit()
    logger.info(f"Deleted chat {chat_id} for user {current_user.id}")
    return jsonify({"message": "Chat deleted"}), 200


@api.route("/history/chat/<chat_id>/message/<int:msg_id>", methods=["DELETE"])
@spec.validate(resp=Response(HTTP_200=DeleteResponse))
@member_required(check_owner=False)
def delete_message(chat_id, msg_id, current_user=None):
    """Delete a single message in a chat. Owner only."""
    chat = Chat.query.get(chat_id)
    if not chat:
        abort_not_found("Chat not found")

    if chat.user_id != current_user.id:
        abort_forbidden("You are not allowed to modify this chat")

    msg = Message.query.filter_by(chat_id=chat.id, id=msg_id).first()
    if not msg:
        abort_not_found("Message not found")

    db.session.delete(msg)
    db.session.commit()
    logger.info(f"Deleted message {msg_id} from chat {chat_id} (user {current_user.id})")
    return jsonify({"message": "Message deleted"}), 200


@api.route("/history/chat/<chat_id>/message/<int:msg_id>/like", methods=["POST"])
@spec.validate(json=LikeMessageRequest, resp=Response(HTTP_200=ChatMessageResponse))
@member_required(check_owner=False)
def like_message(chat_id, msg_id, current_user=None):
    """Like or unlike a message. Body: {"like": true|false}"""
    chat = Chat.query.get(chat_id)
    if not chat:
        abort_not_found("Chat not found")

    if chat.user_id != current_user.id:
        abort_forbidden("You are not allowed to modify this chat")

    payload = request.get_json(silent=True) or {}
    if "like" not in payload:
        abort_bad_request("Missing 'like' field")

    like = bool(payload.get("like"))
    msg = Message.query.filter_by(chat_id=chat.id, id=msg_id).first()
    if not msg:
        abort_not_found("Message not found")

    msg.is_liked = like
    db.session.add(msg)
    db.session.commit()

    jm = {
        "id": msg.id,
        "role": msg.role,
        "content": msg.content,
        "timestamp": None,
        "is_liked": msg.is_liked,
    }
    if getattr(msg, "timestamp", None) is not None:
        try:
            jm["timestamp"] = msg.timestamp.isoformat()
        except Exception:
            jm["timestamp"] = str(msg.timestamp)

    logger.info(f"User {current_user.id} set is_liked={like} on message {msg_id} in chat {chat_id}")
    return jsonify(jm), 200


@api.route("/history/search", methods=["GET"])
@spec.validate(resp=Response(HTTP_200=SearchResponse))
@member_required(check_owner=False)
def search_messages(current_user=None):
    """Search messages across user's chats using `q` query param."""
    q = request.args.get("q", "").strip()
    if not q:
        abort_bad_request("Missing search query parameter `q`")

    # Simple case-insensitive search within messages belonging to user's chats
    msgs = (
        Message.query.join(Chat, Message.chat_id == Chat.id)
        .filter(Chat.user_id == current_user.id)
        .filter(Message.content.ilike(f"%{q}%"))
        .order_by(Message.timestamp.desc())
        .limit(50)
        .all()
    )

    results = []
    for m in msgs:
        jm = {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "timestamp": None,
            "is_liked": m.is_liked,
        }
        if getattr(m, "timestamp", None) is not None:
            try:
                jm["timestamp"] = m.timestamp.isoformat()
            except Exception:
                jm["timestamp"] = str(m.timestamp)
        results.append(jm)

    return jsonify({"results": results}), 200
