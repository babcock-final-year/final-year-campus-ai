import os

from flask import current_app, jsonify, request
from spectree import Response
from werkzeug.utils import secure_filename

from app import db, spec

from ..models import User
from ..schemas import AvatarUploadResponse, UserBase, UserUpdateRequest
from ..services.logger import get_logger
from . import api
from .decorators import member_required
from .errors import abort_bad_request, abort_not_found

logger = get_logger(__name__)


@api.route("/users/<user_id>", methods=["GET"])
def get_user(user_id):
    """Return public user profile (owner may see more fields)."""
    user = User.query.get(user_id)
    if not user:
        abort_not_found("User not found")
    return jsonify({"user": UserBase.model_validate(user).model_dump()}), 200


@api.route("/users/<user_id>", methods=["PUT"])
@spec.validate(json=UserUpdateRequest, resp=Response(HTTP_200=UserBase))
@member_required(check_owner=True, owner_arg="user_id")
def update_user(user_id, current_user=None):
    """Update editable fields on the user's profile.

    This endpoint demonstrates updating username, matric_no, full_name,
    and storing a reference to an avatar URL. Email change flows are
    handled in `auth.py` (request/change-confirm) to preserve the verify
    & confirm flow — so this endpoint does not perform email confirmation.
    """
    user = User.query.get(user_id)
    if not user:
        abort_not_found("User not found")

    data = request.context.json

    # Only update provided fields
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.username is not None:
        user.username = data.username
    if data.matric_no is not None:
        user.matric_no = data.matric_no
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url

    db.session.add(user)
    db.session.commit()

    logger.info(f"User profile updated: {user.id}")
    return jsonify(UserBase.model_validate(user).model_dump()), 200


@api.route("/users/<user_id>/avatar", methods=["POST"])
@member_required(check_owner=True, owner_arg="user_id")
@spec.validate(resp=Response(HTTP_200=AvatarUploadResponse))
def upload_avatar(user_id, current_user=None):
    """Accept a multipart `avatar` file and store it in UPLOAD_FOLDER.

    For simplicity this demo stores the file under `UPLOAD_FOLDER` and
    saves a relative `avatar_url` on the User model. In production you
    would stream to S3/GCS and perform validation.
    """
    user = User.query.get(user_id)
    if not user:
        abort_not_found("User not found")

    if "avatar" not in request.files:
        abort_bad_request("Missing file field `avatar`")

    f = request.files["avatar"]
    if f.filename == "":
        abort_bad_request("No file selected for `avatar`")

    filename = secure_filename(f.filename)
    upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads/")
    os.makedirs(upload_folder, exist_ok=True)
    destination = os.path.join(upload_folder, filename)
    f.save(destination)

    # Store a relative URL/path on the user
    user.avatar_url = f"{upload_folder}/{filename}"
    db.session.add(user)
    db.session.commit()

    logger.info(f"User {user.id} uploaded new avatar: {user.avatar_url}")
    return jsonify(AvatarUploadResponse(avatar_url=user.avatar_url).model_dump()), 200
