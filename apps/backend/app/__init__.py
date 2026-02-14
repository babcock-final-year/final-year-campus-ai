from flask import Flask, jsonify
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from spectree import SpecTree
from config import config

# API Documentation is at /apidoc/swagger/

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
migrate = Migrate()
spec = SpecTree('flask', title="UniPal API", version="v1.0.0", page="swagger")

def create_app(config_name='default'):
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

    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({
            'ok': False,
            'message': 'Missing Authorization Header. Please log in.'
        }), 401

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return jsonify({
            'ok': False,
            'message': 'Session expired. Please log in again.'
        }), 401

    from .api import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api/v1')

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        from .models import TokenBlocklist
        token = TokenBlocklist.query.filter_by(jti=jti).first()
        return token is not None

    @app.route('/')
    def health_check():
        return jsonify({"status": "UniPal Backend is Live", "version": "1.0.0"})

    return app