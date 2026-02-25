from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

# Run this script to update types


# User schema
class UserBase(BaseModel):
    id: str
    full_name: str
    email: EmailStr | None = None
    is_guest: bool

    class Config:
        from_attributes = True  # Critical: Allows reading SQLAlchemy models directly


# Auth schema (Incoming)
class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    token: str


# Auth schema (Outgoing)
class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    user: UserBase


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirmRequest(BaseModel):
    new_password: str = Field(..., min_length=8)


class EmailChangeRequest(BaseModel):
    new_email: EmailStr
    password: str  # To verify it's actually them


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)


# Chat schema (Incoming)
class ChatMessageRequest(BaseModel):
    content: str = Field(..., min_length=1)


# Chat schema (Outgoing)
class ChatMessageResponse(BaseModel):
    id: int
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime
    is_liked: bool | None = None

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    chat_id: str
    title: str
    messages: list[ChatMessageResponse]
