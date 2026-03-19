"use server";
import * as v from "valibot";
import { SERVER_ENV } from "~/constants/env";
import {
	AccessTokenResponseSchema,
	AuthResponseSchema,
	type EmailChangeRequestSchema,
	type GoogleAuthRequestSchema,
	MessageResponseSchema,
	type PasswordResetConfirmRequestSchema,
	type PasswordResetRequestSchema,
	type UserLoginRequestSchema,
	type UserRegisterRequestSchema,
} from "~/models/auth.schemas";
import { coerceToError } from "~/utils/error";
import type { ServerResultResponse } from "./_shared";

const BASE_PATH = `${SERVER_ENV.BACKEND_BASE_URL}/auth` as const;

/**
 * AuthRpc provides type-safe, ergonomic methods for all authentication-related backend routes.
 * Each method abstracts fetch, validates with valibot, and returns a ServerResultResponse.
 */
const AuthRpc = {
	/**
	 * Request an email change for the current user.
	 * @param changeRequest - The new email and current password.
	 * @returns A message indicating confirmation email sent.
	 */
	changeEmail: {
		async post(
			changeRequest: v.InferInput<typeof EmailChangeRequestSchema>,
		): Promise<
			ServerResultResponse<v.InferOutput<typeof MessageResponseSchema>>
		> {
			try {
				const res = await fetch(`${BASE_PATH}/change-email`, {
					body: JSON.stringify(changeRequest),
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					method: "POST",
				});
				return {
					res: v.parse(MessageResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
	},

	/**
	 * Confirm the email change using a token sent to the new email.
	 * @param token - The confirmation token.
	 * @returns A message indicating success or failure.
	 */
	changeEmailConfirm: {
		async get(
			token: string,
		): Promise<
			ServerResultResponse<v.InferOutput<typeof MessageResponseSchema>>
		> {
			try {
				const res = await fetch(
					`${BASE_PATH}/change-email-confirm/${encodeURIComponent(token)}`,
					{
						method: "GET",
					},
				);
				return {
					res: v.parse(MessageResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
	},

	/**
	 * Confirm a user's email using a token.
	 * @param token - The confirmation token from the email.
	 * @returns A message indicating success or failure.
	 */
	confirm: {
		async get(
			token: string,
		): Promise<
			ServerResultResponse<v.InferOutput<typeof MessageResponseSchema>>
		> {
			try {
				const res = await fetch(
					`${BASE_PATH}/confirm/${encodeURIComponent(token)}`,
					{
						method: "GET",
					},
				);
				return {
					res: v.parse(MessageResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
	},

	/**
	 * Login or register a user via Google OAuth.
	 * @param googleRequest - The Google token.
	 * @returns Auth tokens and user info.
	 */
	google: {
		async post(
			googleRequest: v.InferInput<typeof GoogleAuthRequestSchema>,
		): Promise<ServerResultResponse<v.InferOutput<typeof AuthResponseSchema>>> {
			try {
				const res = await fetch(`${BASE_PATH}/google`, {
					body: JSON.stringify(googleRequest),
					headers: { "Content-Type": "application/json" },
					method: "POST",
				});
				return {
					res: v.parse(AuthResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
	},

	/**
	 * Instant login for guests without an account.
	 * @returns Auth tokens and guest user info.
	 */
	guest: {
		async post(): Promise<
			ServerResultResponse<v.InferOutput<typeof AuthResponseSchema>>
		> {
			try {
				const res = await fetch(`${BASE_PATH}/guest`, {
					method: "POST",
				});
				return {
					res: v.parse(AuthResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
	},

	/**
	 * Log in an existing user.
	 * @param loginRequest - The login credentials.
	 * @returns Auth tokens and user info on success.
	 */
	login: {
		async post(
			loginRequest: v.InferInput<typeof UserLoginRequestSchema>,
		): Promise<ServerResultResponse<v.InferOutput<typeof AuthResponseSchema>>> {
			try {
				const res = await fetch(`${BASE_PATH}/login`, {
					body: JSON.stringify(loginRequest),
					headers: { "Content-Type": "application/json" },
					method: "POST",
				});
				return {
					res: v.parse(AuthResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
	},

	/**
	 * Logout the current user by revoking their token.
	 * @returns A message indicating logout status.
	 */
	logout: {
		async post(): Promise<
			ServerResultResponse<v.InferOutput<typeof MessageResponseSchema>>
		> {
			try {
				const res = await fetch(`${BASE_PATH}/logout`, {
					credentials: "include",
					method: "POST",
				});
				return {
					res: v.parse(MessageResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
	},

	/**
	 * Get the current logged-in user's info.
	 * @returns The user object.
	 */
	me: {
		async get(): Promise<ServerResultResponse<{ user: unknown }>> {
			try {
				const res = await fetch(`${BASE_PATH}/me`, {
					credentials: "include",
					method: "GET",
				});

				return {
					res: await res.json(),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
	},

	/**
	 * Refresh the access token using a refresh token.
	 * @returns The new access token.
	 */
	refresh: {
		async post(): Promise<
			ServerResultResponse<v.InferOutput<typeof AccessTokenResponseSchema>>
		> {
			try {
				const res = await fetch(`${BASE_PATH}/refresh`, {
					credentials: "include",
					method: "POST",
				});
				return {
					res: v.parse(AccessTokenResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
	},
	/**
	 * Register a new user.
	 * @param registerRequest - The registration details.
	 * @returns Auth tokens and user info on success.
	 */
	register: {
		async post(
			registerRequest: v.InferInput<typeof UserRegisterRequestSchema>,
		): Promise<ServerResultResponse<v.InferOutput<typeof AuthResponseSchema>>> {
			try {
				const res = await fetch(`${BASE_PATH}/register`, {
					body: JSON.stringify(registerRequest),
					headers: { "Content-Type": "application/json" },
					method: "POST",
				});
				return {
					res: v.parse(AuthResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
	},

	/**
	 * Request a password reset email.
	 * @param request - The email to send the reset link to.
	 * @returns A message indicating if the reset link was sent.
	 */
	resetPassword: {
		async post(
			request: v.InferInput<typeof PasswordResetRequestSchema>,
		): Promise<
			ServerResultResponse<v.InferOutput<typeof MessageResponseSchema>>
		> {
			try {
				const res = await fetch(`${BASE_PATH}/reset-password`, {
					body: JSON.stringify(request),
					headers: { "Content-Type": "application/json" },
					method: "POST",
				});
				return {
					res: v.parse(MessageResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
	},

	/**
	 * Confirm password reset using a token and set a new password.
	 * @param token - The reset token from the email.
	 * @param request - The new password.
	 * @returns A message indicating if the password was updated.
	 */
	resetPasswordConfirm: {
		async post(
			token: string,
			request: v.InferInput<typeof PasswordResetConfirmRequestSchema>,
		): Promise<
			ServerResultResponse<v.InferOutput<typeof MessageResponseSchema>>
		> {
			try {
				const res = await fetch(
					`${BASE_PATH}/reset-password-confirm/${encodeURIComponent(token)}`,
					{
						body: JSON.stringify(request),
						headers: { "Content-Type": "application/json" },
						method: "POST",
					},
				);
				return {
					res: v.parse(MessageResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
	},
} as const;

export default AuthRpc;
