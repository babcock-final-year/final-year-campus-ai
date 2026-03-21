from datetime import datetime
import os

from flask import current_app, jsonify, redirect, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer as Serializer
from spectree import Response

from app import db, spec

from ..models import TokenBlocklist, User
from ..schemas import (
    AuthResponse,
    EmailChangeRequest,
    GoogleAuthRequest,
    PasswordResetConfirmRequest,
    UserBase,
    UserLoginRequest,
    UserRegisterRequest,
)
from ..services.logger import get_logger
from ..services.mailer import send_email
from . import api
from .errors import (
    abort_bad_request,
    abort_conflict,
    abort_forbidden,
    abort_not_found,
    abort_unauthorized,
)

logger = get_logger(__name__)


# Helper function
def get_user_from_token(token, salt):
    s = Serializer(current_app.config["SECRET_KEY"])
    try:
        # Map salt to configured expiry values
        if salt == "email-confirm":
            max_age = current_app.config.get("CONFIRM_TOKEN_EXPIRES", 3600)
        elif salt == "password-reset":
            max_age = current_app.config.get("RESET_TOKEN_EXPIRES", 3600)
        elif salt == "email-change":
            max_age = current_app.config.get("EMAIL_CHANGE_TOKEN_EXPIRES", 3600)
        else:
            max_age = current_app.config.get("CONFIRM_TOKEN_EXPIRES", 3600)
        data = s.loads(token, salt=salt, max_age=max_age)
    except (SignatureExpired, BadSignature):
        return None
    user_id = data.get("confirm") or data.get("reset") or data.get("change_email")
    if not user_id:
        return None
    return User.query.get(user_id)


@api.route("/auth/register", methods=["POST"])
@spec.validate(
    json=UserRegisterRequest, resp=Response(HTTP_201=AuthResponse), tags=["Authentication"]
)
def register():
    """Register a new student via email/password."""

    data = request.context.json

    if User.query.filter_by(email=data.email).first():
        abort_conflict("User with this email already exists")

    user = User(full_name=data.full_name, username=data.email, email=data.email)

    user.password = data.password

    db.session.add(user)
    db.session.commit()

    token = user.generate_confirmation_token()

    base = current_app.config.get("BASE_URL", "http://localhost:5000")
    confirm_url = f"{base}/api/v1/auth/confirm/{token}"

    send_email(
        user.email,
        "Confirm Your Account",
        "auth/email/confirm",
        user=user,
        token=token,
        confirm_url=confirm_url,
    )

    logger.info(f"New user registered: {user.email} (ID: {user.id})")
    return jsonify(
        {
            "access_token": create_access_token(identity=user.id),
            "refresh_token": create_refresh_token(identity=user.id),
            "user": UserBase.model_validate(user).model_dump(),
        }
    ), 201


@api.route("/auth/confirm/<token>", methods=["GET"])
def confirm(token):
    user = get_user_from_token(token, "email-confirm")

    if user is None:
        logger.warning("Email confirmation failed: Invalid or expired token")
        frontend = current_app.config.get("BASE_URL", "http://localhost:3030")
        login_path = current_app.config.get("FRONTEND_LOGIN_PATH", "/sign-up")
        redirect_url = f"{frontend.rstrip('/')}{login_path}?invalid=2"
        return redirect(redirect_url)

    if user.is_confirmed:
        logger.info(
            f"Email confirmation attempted for already confirmed account: {user.email} (ID: {user.id})"
        )
        return jsonify({"message": "Account already confirmed"}), 200

    if user.confirm_email(token):
        db.session.commit()

        logger.info(f"Email confirmed successfully for user: {user.email} (ID: {user.id})")
        frontend = current_app.config.get("BASE_URL", "http://localhost:3030")
        login_path = current_app.config.get("FRONTEND_LOGIN_PATH", "/sign-up")
        redirect_url = f"{frontend.rstrip('/')}{login_path}?confirmed=1"
        return redirect(redirect_url)

    logger.warning(
        f"Email confirmation failed for user: {user.email} (ID: {user.id}) - Token verification failed"
    )
    abort_bad_request("Confirmation failed")


@api.route("/auth/login", methods=["POST"])
@spec.validate(json=UserLoginRequest, resp=Response(HTTP_200=AuthResponse), tags=["Authentication"])
def login():
    """Manual login for existing students."""

    data = request.context.json
    user = User.query.filter_by(email=data.email).first()
    if not user:
        logger.warning(f"Login failed: No user found with email {data.email}")
        abort_unauthorized("Invalid email or password")

    # If the user was created via OAuth or as a guest, they may not have a password
    if not user.password_hash:
        logger.warning(f"Login failed: User {data.email} has no local password set")
        abort_unauthorized(
            "No local password set for this account. Please login via OAuth or reset your password."
        )

    if not user.verify_password(data.password):
        logger.warning(f"Login failed: Incorrect password for user {data.email}")
        abort_unauthorized("Invalid email or password")

    if not user.is_confirmed:
        logger.warning(f"Login failed: Unconfirmed account {data.email}")
        abort_forbidden("Account not confirmed. Please check your email.")

    logger.info(f"User logged in successfully: {user.email} (ID: {user.id})")
    return jsonify(
        {
            "access_token": create_access_token(identity=user.id),
            "refresh_token": create_refresh_token(identity=user.id),
            "user": UserBase.model_validate(user).model_dump(),
        }
    ), 200


@api.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    """Get current logged-in user's info."""

    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        logger.warning(f"User info request failed: No user found with ID {current_user_id}")
        abort_not_found("User not found")

    logger.info(f"User info retrieved for user: {user.email} (ID: {user.id})")
    return jsonify({"user": UserBase.model_validate(user).model_dump()}), 200


@api.route("/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_token():
    """Refresh access token using a valid refresh token."""

    logger.info(f"Token refresh requested by user ID: {get_jwt_identity()}")
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify({"access_token": new_access_token}), 200


@api.route("/auth/guest", methods=["POST"])
@spec.validate(resp=Response(HTTP_201=AuthResponse), tags=["Authentication"])
def guest_login():
    """Instant login for guests without an account."""

    user = User(
        full_name="Guest Student",
        email=f"guest{datetime.now().timestamp()}@example.com",
        is_guest=True,
        is_confirmed=True,
    )

    db.session.add(user)
    db.session.commit()

    logger.info(f"Guest user created: {user.email} (ID: {user.id})")
    return {
        "access_token": create_access_token(identity=user.id),
        "refresh_token": create_refresh_token(identity=user.id),
        "user": UserBase.model_validate(user).model_dump(),
    }, 201


@api.route("/auth/google", methods=["POST"])
@spec.validate(
    json=GoogleAuthRequest, resp=Response(HTTP_200=AuthResponse), tags=["Authentication"]
)
def google_auth():
    """Verify Google token and login/register the user."""

    data = request.context.json
    try:
        idinfo = id_token.verify_oauth2_token(
            data.token, google_requests.Request(), os.environ.get("GOOGLE_CLIENT_ID")
        )

        user = User.query.filter_by(email=idinfo["email"]).first()

        if not user:
            user = User(full_name=idinfo["name"], email=idinfo["email"], google_id=idinfo["sub"])
            user.is_confirmed = True

            db.session.add(user)
            db.session.commit()

        logger.info(f"Google authentication successful for user: {user.email} (ID: {user.id})")
        return {
            "access_token": create_access_token(identity=user.id),
            "refresh_token": create_refresh_token(identity=user.id),
            "user": UserBase.model_validate(user).model_dump(),
        }, 200

    except ValueError:
        logger.warning("Google authentication failed: Invalid token")
        abort_bad_request("Invalid Google Token")


@api.route("/auth/logout", methods=["POST"])
@jwt_required()
def logout():
    """Logout user by revoking their token."""
    jwt_data = get_jwt()
    jti = jwt_data.get("jti")
    if not jti:
        logger.warning("Logout failed: No JTI found in token")
        abort_bad_request("Unable to revoke token")

    revoked_token = TokenBlocklist(jti=jti)
    db.session.add(revoked_token)
    db.session.commit()

    logger.info(f"User logged out successfully, token revoked: JTI {jti}")
    return jsonify({"message": "Successfully logged out"}), 200


@api.route("/auth/change-email", methods=["POST"])
@jwt_required()
@spec.validate(json=EmailChangeRequest, tags=["Authentication"])
def request_change_email():
    """Request an email change: sends confirmation to the new email."""

    data = request.context.json
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        logger.warning(f"Email change request failed: No user found with ID {current_user_id}")
        abort_not_found("User not found")

    # Verify password is correct for security
    if not user.password_hash or not user.verify_password(data.password):
        logger.warning(
            f"Email change request failed: Incorrect password for user {user.email} (ID: {user.id})"
        )
        abort_unauthorized("Invalid password")

    new_email = data.new_email
    if User.query.filter_by(email=new_email).first():
        logger.warning(f"Email change request failed: Email {new_email} already in use")
        abort_conflict("Email already in use")

    token = user.generate_email_change_token(new_email)
    confirm_url = f"http://localhost:5000/api/v1/auth/change-email-confirm/{token}"

    send_email(
        new_email,
        "Confirm Your New Email",
        "auth/email/change_email",
        user=user,
        token=token,
        confirm_url=confirm_url,
    )

    logger.info(
        f"Email change requested for user: {user.email} (ID: {user.id}), confirmation sent to {new_email}"
    )
    return jsonify({"message": "Confirmation email sent to the new address."}), 200


@api.route("/auth/change-email-confirm/<token>", methods=["GET"])
def confirm_change_email(token):
    """Confirm the email change using token sent to new email."""

    user = get_user_from_token(token, "email-change")
    if user is None:
        logger.warning("Email change confirmation failed: Invalid or expired token")
        abort_bad_request("Invalid or expired link")

    if user.change_email(token):
        db.session.commit()
        logger.info(f"Email address updated successfully for user: {user.email} (ID: {user.id})")
        return jsonify({"message": "Email address updated successfully"}), 200

    logger.warning(
        f"Email change confirmation failed for user: {user.email} (ID: {user.id}) - Token verification failed"
    )
    abort_bad_request("Email change failed")


@api.route("/auth/reset-password", methods=["POST"])
def request_password_reset():
    data = request.get_json()
    user = User.query.filter_by(email=data.get("email")).first()

    if not user:
        return jsonify({"message": "If the email is registered, a reset link was sent."}), 200

    token = user.generate_reset_token()

    base = current_app.config.get("BASE_URL", "http://localhost:5000")
    reset_url = f"{base}/api/v1/auth/reset-password-confirm/{token}"
    send_email(
        user.email,
        "Reset Your Password",
        "auth/email/reset_password",
        user=user,
        token=token,
        reset_url=reset_url,
    )

    logger.info(f"Password reset requested for user: {user.email} (ID: {user.id}), reset link sent")
    return jsonify({"message": "If the email is registered, a reset link was sent."}), 200


@api.route("/auth/reset-password-confirm/<token>", methods=["POST"])
@spec.validate(json=PasswordResetConfirmRequest, tags=["Auth"])
def reset_password(token):
    data = request.context.json

    if User.reset_password(token, data.new_password):
        db.session.commit()
        logger.info("Password reset successful using token")
        return jsonify({"message": "Your password has been updated."}), 200

    logger.warning("Password reset failed: Invalid or expired token")
    abort_bad_request("The reset link is invalid or has expired.")
