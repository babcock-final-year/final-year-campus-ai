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
export interface EmailChangeRequest {
  new_email: string;
  password: string;
}
export interface GoogleAuthRequest {
  token: string;
}
export interface PasswordResetConfirmRequest {
  new_password: string;
}
export interface PasswordResetRequest {
  email: string;
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
