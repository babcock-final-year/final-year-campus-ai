import { query } from "@solidjs/router";
import * as v from "valibot";
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
import { getClientEnv } from "~/utils/env";
import { coerceToError } from "~/utils/error";
import type { ServerResultResponse } from "./_shared";

/**
 * AuthRpc provides type-safe, ergonomic methods for all authentication-related backend routes.
 * Each method is wrapped in SolidStart query for caching/deduplication.
 */
const BASE_PATH = `${getClientEnv().VITE_BACKEND_BASE_URL}/auth` as const;

const AuthRpc = {
	/**
	 * Request an email change for the current user.
	 * @param changeRequest - The new email and current password.
	 * @returns A message indicating confirmation email sent.
	 */
	changeEmail: {
		post: query(
			async (
				changeRequest: v.InferInput<typeof EmailChangeRequestSchema>,
			): Promise<
				ServerResultResponse<v.InferOutput<typeof MessageResponseSchema>>
			> => {
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
			"AuthRpc.changeEmail.post",
		),
	},

	/**
	 * Confirm the email change using a token sent to the new email.
	 * @param token - The confirmation token.
	 * @returns A message indicating success or failure.
	 */
	changeEmailConfirm: {
		get: query(
			async (
				token: string,
			): Promise<
				ServerResultResponse<v.InferOutput<typeof MessageResponseSchema>>
			> => {
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
			"AuthRpc.changeEmailConfirm.get",
		),
	},

	/**
	 * Confirm a user's email using a token.
	 * @param token - The confirmation token from the email.
	 * @returns A message indicating success or failure.
	 */
	confirm: {
		get: query(
			async (
				token: string,
			): Promise<
				ServerResultResponse<v.InferOutput<typeof MessageResponseSchema>>
			> => {
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
			"AuthRpc.confirm.get",
		),
	},

	/**
	 * Login or register a user via Google OAuth.
	 * @param googleRequest - The Google token.
	 * @returns Auth tokens and user info.
	 */
	google: {
		post: query(
			async (
				googleRequest: v.InferInput<typeof GoogleAuthRequestSchema>,
			): Promise<
				ServerResultResponse<v.InferOutput<typeof AuthResponseSchema>>
			> => {
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
			"AuthRpc.google.post",
		),
	},

	/**
	 * Instant login for guests without an account.
	 * @returns Auth tokens and guest user info.
	 */
	guest: {
		post: query(
			async (): Promise<
				ServerResultResponse<v.InferOutput<typeof AuthResponseSchema>>
			> => {
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
			"AuthRpc.guest.post",
		),
	},

	/**
	 * Log in an existing user.
	 * @param loginRequest - The login credentials.
	 * @returns Auth tokens and user info on success.
	 */
	login: {
		post: query(
			async (
				loginRequest: v.InferInput<typeof UserLoginRequestSchema>,
			): Promise<
				ServerResultResponse<v.InferOutput<typeof AuthResponseSchema>>
			> => {
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
			"AuthRpc.login.post",
		),
	},

	/**
	 * Logout the current user by revoking their token.
	 * @returns A message indicating logout status.
	 */
	logout: {
		post: query(
			async (): Promise<
				ServerResultResponse<v.InferOutput<typeof MessageResponseSchema>>
			> => {
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
			"AuthRpc.logout.post",
		),
	},

	/**
	 * Get the current logged-in user's info.
	 * @returns The user object.
	 */
	me: {
		get: query(async (): Promise<ServerResultResponse<{ user: unknown }>> => {
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
		}, "AuthRpc.me.get"),
	},

	/**
	 * Refresh the access token using a refresh token.
	 * @returns The new access token.
	 */
	refresh: {
		post: query(
			async (): Promise<
				ServerResultResponse<v.InferOutput<typeof AccessTokenResponseSchema>>
			> => {
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
			"AuthRpc.refresh.post",
		),
	},

	/**
	 * Register a new user.
	 * @param registerRequest - The registration details.
	 * @returns Auth tokens and user info on success.
	 */
	register: {
		post: query(
			async (
				registerRequest: v.InferInput<typeof UserRegisterRequestSchema>,
			): Promise<
				ServerResultResponse<v.InferOutput<typeof AuthResponseSchema>>
			> => {
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
			"AuthRpc.register.post",
		),
	},

	/**
	 * Request a password reset email.
	 * @param request - The email to send the reset link to.
	 * @returns A message indicating if the reset link was sent.
	 */
	resetPassword: {
		post: query(
			async (
				request: v.InferInput<typeof PasswordResetRequestSchema>,
			): Promise<
				ServerResultResponse<v.InferOutput<typeof MessageResponseSchema>>
			> => {
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
			"AuthRpc.resetPassword.post",
		),
	},

	/**
	 * Confirm password reset using a token and set a new password.
	 * @param token - The reset token from the email.
	 * @param request - The new password.
	 * @returns A message indicating if the password was updated.
	 */
	resetPasswordConfirm: {
		post: query(
			async (
				token: string,
				request: v.InferInput<typeof PasswordResetConfirmRequestSchema>,
			): Promise<
				ServerResultResponse<v.InferOutput<typeof MessageResponseSchema>>
			> => {
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
			"AuthRpc.resetPasswordConfirm.post",
		),
	},
} as const;

export default AuthRpc;
