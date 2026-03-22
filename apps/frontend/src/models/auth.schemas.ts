import * as v from "valibot";
import { EmailSchema } from "./shared";
import { UserBaseSchema } from "./users.schemas";

/**
 * Schema for the request body of /auth/register
 */
export const UserRegisterRequestSchema = v.object({
	email: EmailSchema,
	full_name: v.string(),
	password: v.string(),
});
export type UserRegisterRequestInput = v.InferInput<
	typeof UserRegisterRequestSchema
>;
export type UserRegisterRequestOutput = v.InferOutput<
	typeof UserRegisterRequestSchema
>;

/**
 * Schema for the request body of /auth/login
 */
export const UserLoginRequestSchema = v.object({
	email: EmailSchema,
	password: v.string(),
});
export type UserLoginRequestInput = v.InferInput<typeof UserLoginRequestSchema>;
export type UserLoginRequestOutput = v.InferOutput<
	typeof UserLoginRequestSchema
>;

/**
 * Schema for the request body of /auth/google
 */
export const GoogleAuthRequestSchema = v.object({
	credential: v.string(),
});
export type GoogleAuthRequestInput = v.InferInput<
	typeof GoogleAuthRequestSchema
>;
export type GoogleAuthRequestOutput = v.InferOutput<
	typeof GoogleAuthRequestSchema
>;

/**
 * Schema for the request body of /auth/change-email
 */
export const EmailChangeRequestSchema = v.object({
	new_email: EmailSchema,
	password: v.string(),
});
export type EmailChangeRequestInput = v.InferInput<
	typeof EmailChangeRequestSchema
>;
export type EmailChangeRequestOutput = v.InferOutput<
	typeof EmailChangeRequestSchema
>;

/**
 * Schema for the request body of /auth/reset-password-confirm/<token>
 */
export const PasswordResetConfirmRequestSchema = v.object({
	new_password: v.string(),
});
export type PasswordResetConfirmRequestInput = v.InferInput<
	typeof PasswordResetConfirmRequestSchema
>;
export type PasswordResetConfirmRequestOutput = v.InferOutput<
	typeof PasswordResetConfirmRequestSchema
>;

export const AuthResponseSchema = v.object({
	access_token: v.string(),
	refresh_token: v.string(),
	token_type: v.nullish(v.string(), "Bearer"),
	user: UserBaseSchema,
});
export type AuthResponseInput = v.InferInput<typeof AuthResponseSchema>;
export type AuthResponseOutput = v.InferOutput<typeof AuthResponseSchema>;

/**
 * Schema for generic message responses (e.g., confirm, reset, logout, etc)
 */
export const MessageResponseSchema = v.object({
	message: v.string(),
});
export type MessageResponseInput = v.InferInput<typeof MessageResponseSchema>;
export type MessageResponseOutput = v.InferOutput<typeof MessageResponseSchema>;

/**
 * Schema for the response of /auth/refresh
 */
export const AccessTokenResponseSchema = v.object({
	access_token: v.string(),
});
export type AccessTokenResponseInput = v.InferInput<
	typeof AccessTokenResponseSchema
>;
export type AccessTokenResponseOutput = v.InferOutput<
	typeof AccessTokenResponseSchema
>;

/**
 * Schema for the request body of /auth/reset-password
 */
export const PasswordResetRequestSchema = v.object({
	email: EmailSchema,
});
export type PasswordResetRequestInput = v.InferInput<
	typeof PasswordResetRequestSchema
>;
export type PasswordResetRequestOutput = v.InferOutput<
	typeof PasswordResetRequestSchema
>;
