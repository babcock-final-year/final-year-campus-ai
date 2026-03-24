from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from spectree import SpecTree

from config import config

from .services.logger import get_logger

# API Documentation is at /apidoc/swagger/

logger = get_logger(__name__)
db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
migrate = Migrate()
spec = SpecTree("flask", title="UniPal API", version="v1.0.0", page="swagger")


def create_app(config_name="default"):
    """
    Application Factory for UniPal.
    Initializes Flask, extensions, and registers blueprints.
    """

    app = Flask(__name__)

    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    spec.register(app)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return jsonify({"ok": False, "message": "Session expired. Please log in again."}), 401

    @jwt.unauthorized_loader
    def handle_missing_token(error):
        return jsonify({"ok": False, "message": "Missing token. Please log in."}), 401

    @jwt.invalid_token_loader
    def handle_invalid_token(error):
        return jsonify({"ok": False, "message": "Invalid token. Please log in again."}), 401

    from .api import api as api_blueprint

    app.register_blueprint(api_blueprint, url_prefix="/api/v1")

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        from .models import TokenBlocklist

        token = TokenBlocklist.query.filter_by(jti=jti).first()
        return token is not None

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        from .models import User

        user = db.session.get(User, identity)
        if not user:
            logger.warning(f"JWT identity {identity} not found in DB")
        return user

    @app.route("/")
    def health_check():
        return jsonify({"status": "UniPal Backend is Live", "version": "1.0.0"})

    return app
