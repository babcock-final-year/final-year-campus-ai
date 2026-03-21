from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# Run this script to update types


# User schema
class UserBase(BaseModel):
    id: str
    full_name: str
    email: EmailStr | None = None
    is_guest: bool
    matric_no: str | None = None
    avatar_url: str | None = None

    model_config = ConfigDict(
        from_attributes=True
    )  # Critical: Allows reading SQLAlchemy models directly


# Auth schema (Incoming)
class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    credential: str


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
    timestamp: datetime | str
    is_liked: bool | None = None

    model_config = ConfigDict(from_attributes=True)


class ChatHistoryResponse(BaseModel):
    chat_id: str
    title: str
    messages: list[ChatMessageResponse]


# History / UI schemas
class ChatSummary(BaseModel):
    id: str
    title: str
    created_at: datetime | str | None = None


class ChatsListResponse(BaseModel):
    chats: list[ChatSummary]


class DeleteResponse(BaseModel):
    message: str


class LikeMessageRequest(BaseModel):
    like: bool


class SearchResponse(BaseModel):
    results: list[ChatMessageResponse]


# User profile update schemas
class UserUpdateRequest(BaseModel):
    full_name: str | None = None
    username: str | None = None
    matric_no: str | None = None
    avatar_url: str | None = None


class AvatarUploadResponse(BaseModel):
    avatar_url: str


# Complaint schemas
class ComplaintCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=3)


class ComplaintResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: str
    status: str
    created_at: datetime | str

    model_config = ConfigDict(from_attributes=True)


class ComplaintListResponse(BaseModel):
    complaints: list[ComplaintResponse]
