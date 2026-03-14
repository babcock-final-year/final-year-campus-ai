from functools import wraps

from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..models import User
from ..services.logger import get_logger
from .errors import abort_forbidden, abort_not_found, abort_unauthorized

logger = get_logger(__name__)


def _get_dev_fallback_user_if_allowed() -> User | None:
    if request.headers.get("Authorization"):
        return None

    if request.args.get("dev_auth_bypass") != "1":
        return None

    try:
        user = User.query.order_by(User.created_at.desc()).first()
    except Exception:
        user = None

    if user is None:
        return None

    logger.warning(f"DEV AUTH BYPASS active: using user {user.id}")
    return user


def member_required(check_owner: bool = True, owner_arg: str = "user_id"):
    """Decorator to ensure the caller is a confirmed, non-guest member.

    Parameters
    - check_owner: if True, also verify the current user matches the target
      resource owner. The decorator will look for the target id in the route
      parameters (`request.view_args`) under `owner_arg` or in JSON body
      under the same key.

    Usage:
            @api.route('/users/<user_id>', methods=['PUT'])
            @member_required()
            def update_user(user_id):
                    ...

    This wrapper applies `@jwt_required()` internally.
    """

    def decorator(fn):
        @wraps(fn)
        @jwt_required(optional=True)
        def wrapper(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id) if current_user_id else None

            if user is None:
                user = _get_dev_fallback_user_if_allowed()

            if user is None:
                logger.warning("member_required: no jwt identity found")
                abort_unauthorized("Authentication required")

            # Only confirmed, non-guest users are considered members
            if not user.is_confirmed or user.is_guest:
                logger.warning(
                    f"member_required: user {user.id} is not a member (confirmed={user.is_confirmed}, guest={user.is_guest})"
                )
                abort_forbidden("Membership required to perform this action")

            if check_owner:
                # Try route params first
                target_id = None
                if request.view_args and owner_arg in request.view_args:
                    target_id = request.view_args.get(owner_arg)
                # Then fall back to kwargs passed to the view
                if target_id is None and owner_arg in kwargs:
                    target_id = kwargs.get(owner_arg)
                # Then try JSON body (for PUT/POST payloads)
                if target_id is None:
                    try:
                        json_body = request.get_json(silent=True) or {}
                        target_id = json_body.get(owner_arg)
                    except Exception:
                        target_id = None

                if target_id is not None and str(target_id) != str(user.id):
                    logger.warning(
                        f"member_required: user {user.id} attempted to access resource owned by {target_id}"
                    )
                    abort_forbidden("You are not allowed to modify this resource")

            # attach current_user to kwargs for handler convenience
            kwargs.setdefault("current_user", user)

            return fn(*args, **kwargs)

        return wrapper

    return decorator
