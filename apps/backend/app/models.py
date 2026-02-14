import uuid
from flask import current_app
from itsdangerous import URLSafeTimedSerializer as Serializer
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

# How to migrate
# flask db init (One time)
# flask db migrate -m "description of changes"
# flask db upgrade

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda : str(uuid.uuid4()))
    full_name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=True, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    matric_no = db.Column(db.String(20), unique=True, nullable=True) 
    password_hash = db.Column(db.String(255), nullable=True) 

    is_confirmed = db.Column(db.Boolean, default=False)

    # Flag to identify guest accounts
    is_guest = db.Column(db.Boolean, default=False)

    # Google OAuth specific fields
    google_id = db.Column(db.String(100), unique=True, nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    chats = db.relationship('Chat', backref='user', lazy='dynamic', cascade="all, delete-orphan")
    complaints = db.relationship('Complaint', backref='user', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.username}>'

    @property
    def password(self):
        raise AttributeError('Password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_confirmation_token(self):
        s = Serializer(current_app.config['SECRET_KEY'])
        return s.dumps({'confirm': self.id}, salt='email-confirm')

    def confirm_email(self, token):
        s = Serializer(current_app.config['SECRET_KEY'])
        try:
            max_age = current_app.config.get('CONFIRM_TOKEN_EXPIRES', 3600)
            data = s.loads(token, salt='email-confirm', max_age=max_age)
        except Exception:
            return False
        
        if data.get('confirm') != self.id:
            return False
        
        self.is_confirmed = True
        db.session.add(self)
        return True
    
    def generate_reset_token(self):
        s = Serializer(current_app.config['SECRET_KEY'])
        return s.dumps({'reset': self.id}, salt='password-reset')

    @staticmethod
    def reset_password(token, new_password):
        s = Serializer(current_app.config['SECRET_KEY'])
        try:
            max_age = current_app.config.get('RESET_TOKEN_EXPIRES', 3600)
            data = s.loads(token, salt='password-reset', max_age=max_age)
        except Exception:
            return False
        
        user = User.query.get(data.get('reset'))
        if user is None:
            return False
        
        user.password = new_password
        db.session.add(user)
        return True
    
    def generate_email_change_token(self, new_email):
        s = Serializer(current_app.config['SECRET_KEY'])
        return s.dumps(
            {'change_email': self.id, 'new_email': new_email}, salt='email-change')

    def change_email(self, token):
        s = Serializer(current_app.config['SECRET_KEY'])
        try:
            max_age = current_app.config.get('EMAIL_CHANGE_TOKEN_EXPIRES', 3600)
            data = s.loads(token, salt='email-change', max_age=max_age)
        except Exception:
            return False
        
        if data.get('change_email') != self.id:
            return False
        new_email = data.get('new_email')
        if new_email is None:
            return False
        if User.query.filter_by(email=new_email).first() is not None:
            return False
        self.email = new_email
        db.session.add(self)
        return True
 
class TokenBlocklist(db.Model):
    __tablename__ = 'token_blocklist'

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Chat(db.Model):
    __tablename__ = 'chats'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), default="New Conversation")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    messages = db.relationship('Message', backref='chat', lazy='dynamic', cascade="all, delete-orphan")

class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.String(36), db.ForeignKey('chats.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'user' or 'AI'
    content = db.Column(db.Text, nullable=False)

    # UI Interaction Fields
    is_liked = db.Column(db.Boolean, default=None, nullable=True)
    is_shared = db.Column(db.Boolean, default=True)

    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Complaint(db.Model):
    __tablename__ = 'complaints'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="pending") # pending, resolved, dismissed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

