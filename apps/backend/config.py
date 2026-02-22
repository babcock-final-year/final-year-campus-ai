import os, secrets
from dotenv import load_dotenv, find_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
dotenv_path = os.path.join(basedir, '.env')
load_dotenv(find_dotenv(dotenv_path), override=False)

# RAG
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
GEMINI_EMBEDDINGS_MODEL = os.getenv("GEMINI_EMBEDDINGS_MODEL", "text-embedding-004")
GEMINI_LLM_MODEL = os.getenv("GEMINI_LLM_MODEL", "gemini-3-pro")
HF_EMBEDDINGS_MODEL = os.environ.get('HF_EMBEDDINGS_MODEL')
HF_ACCESS_TOKEN = os.environ.get('HF_ACCESS_TOKEN')
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
GROQ_LLM_MODEL = os.getenv("GROQ_LLM_MODEL")
DATA_DIRECTORY = os.path.join(basedir, os.environ.get('DATA_DIRECTORY') or 'data')
CHROMA_PATH = os.path.join(basedir, os.environ.get('CHROMA_PATH') or 'chroma_db')
PROMPT_PATH = os.path.join(basedir, os.environ.get('PROMPT_PATH') or "prompt.txt")
TOP_K = int(os.environ.get('TOP_K') or 5)

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or secrets.token_hex(32)

    MAIL_SERVER = 'smtp.googlemail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_HEADERS = 'Content-Type'

    # App-specific settings
    BASE_URL = os.environ.get('BASE_URL') or 'http://localhost:5000'
    CONFIRM_TOKEN_EXPIRES = int(os.environ.get('CONFIRM_TOKEN_EXPIRES') or 3600)
    RESET_TOKEN_EXPIRES = int(os.environ.get('RESET_TOKEN_EXPIRES') or 3600)
    EMAIL_CHANGE_TOKEN_EXPIRES = int(os.environ.get('EMAIL_CHANGE_TOKEN_EXPIRES') or 3600)
    
    @staticmethod
    def init_app(app):
        pass

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'data-dev.db')

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or \
        'sqlite:///:memory:'

class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}