import * as v from "valibot";
import { EmailSchema } from "./shared";

/**
 * Schema for the request body of /auth/register
 */
export const UserRegisterRequestSchema = v.object({
	email: EmailSchema,
	full_name: v.string(),
	password: v.string(),
});

/**
 * Schema for the request body of /auth/login
 */
export const UserLoginRequestSchema = v.object({
	email: EmailSchema,
	password: v.string(),
});

/**
 * Schema for the request body of /auth/google
 */
export const GoogleAuthRequestSchema = v.object({
	token: v.string(),
});

/**
 * Schema for the request body of /auth/change-email
 */
export const EmailChangeRequestSchema = v.object({
	new_email: EmailSchema,
	password: v.string(),
});

/**
 * Schema for the request body of /auth/reset-password-confirm/<token>
 */
export const PasswordResetConfirmRequestSchema = v.object({
	new_password: v.string(),
});

/**
 * Schema for the response of /auth endpoints returning user and tokens
 */
export const UserBaseSchema = v.object({
	avatar_url: v.optional(v.string()),
	email: EmailSchema,
	full_name: v.string(),
	id: v.number(),
	is_confirmed: v.optional(v.boolean()),
	is_guest: v.optional(v.boolean()),
	matric_no: v.optional(v.string()),
	username: v.string(),
});

export const AuthResponseSchema = v.object({
	access_token: v.string(),
	refresh_token: v.string(),
	user: UserBaseSchema,
});

/**
 * Schema for generic message responses (e.g., confirm, reset, logout, etc)
 */
export const MessageResponseSchema = v.object({
	message: v.string(),
});

/**
 * Schema for the response of /auth/refresh
 */
export const AccessTokenResponseSchema = v.object({
	access_token: v.string(),
});

/**
 * Schema for the request body of /auth/reset-password
 */
export const PasswordResetRequestSchema = v.object({
	email: EmailSchema,
});
