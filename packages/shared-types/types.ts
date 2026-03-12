/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export interface AuthResponse {
	access_token: string;
	refresh_token: string;
	token_type?: string;
	user: UserBase;
}
export interface UserBase {
	id: string;
	full_name: string;
	email?: string | null;
	is_guest: boolean;
}
export interface AvatarUploadResponse {
	avatar_url: string;
}
export interface ChangePasswordRequest {
	old_password: string;
	new_password: string;
}
export interface ChatHistoryResponse {
	chat_id: string;
	title: string;
	messages: ChatMessageResponse[];
}
export interface ChatMessageResponse {
	id: number;
	role: string;
	content: string;
	timestamp: string;
	is_liked?: boolean | null;
}
export interface ChatMessageRequest {
	content: string;
}
export interface ChatSummary {
	id: string;
	title: string;
	created_at?: string | null;
}
export interface ChatsListResponse {
	chats: ChatSummary[];
}
export interface ComplaintCreateRequest {
	title: string;
	description: string;
}
export interface ComplaintListResponse {
	complaints: ComplaintResponse[];
}
export interface ComplaintResponse {
	id: number;
	user_id: string;
	title: string;
	description: string;
	status: string;
	created_at: string;
}
export interface DeleteResponse {
	message: string;
}
export interface EmailChangeRequest {
	new_email: string;
	password: string;
}
export interface GoogleAuthRequest {
	token: string;
}
export interface LikeMessageRequest {
	like: boolean;
}
export interface PasswordResetConfirmRequest {
	new_password: string;
}
export interface PasswordResetRequest {
	email: string;
}
export interface SearchResponse {
	results: ChatMessageResponse[];
}
export interface UserLoginRequest {
	email: string;
	password: string;
}
export interface UserRegisterRequest {
	full_name: string;
	email: string;
	password: string;
}
export interface UserUpdateRequest {
	full_name?: string | null;
	username?: string | null;
	matric_no?: string | null;
	avatar_url?: string | null;
}
