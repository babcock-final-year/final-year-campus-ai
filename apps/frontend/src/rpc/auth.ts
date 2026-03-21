import { query } from "@solidjs/router";
import * as v from "valibot";
import {
	type AccessTokenResponseOutput,
	AccessTokenResponseSchema,
	type AuthResponseOutput,
	AuthResponseSchema,
	type EmailChangeRequestInput,
	EmailChangeRequestSchema,
	type GoogleAuthRequestInput,
	GoogleAuthRequestSchema,
	type MessageResponseOutput,
	MessageResponseSchema,
	type PasswordResetConfirmRequestInput,
	PasswordResetConfirmRequestSchema,
	type PasswordResetRequestInput,
	PasswordResetRequestSchema,
	type UserLoginRequestInput,
	UserLoginRequestSchema,
	type UserRegisterRequestInput,
	UserRegisterRequestSchema,
} from "~/models/auth.schemas";
import { type UserBaseOutput, UserBaseSchema } from "~/models/users.schemas";
import { getClientEnv } from "~/utils/env";
import { coerceToError } from "~/utils/error";
import type { ServerResultResponse } from "./_shared";
import fetchWithAuth from "./fetchWithAuth";

/**
 * AuthRpc provides type-safe, ergonomic methods for all authentication-related backend routes.
 * Each method is wrapped in SolidStart query for caching/deduplication.
 */
const BASE_PATH =
	`${getClientEnv().VITE_BACKEND_BASE_URL}/api/v1/auth` as const;

const AuthRpc = {
	/**
	 * Request an email change for the current user.
	 * @param changeRequest - The new email and current password.
	 * @returns A message indicating confirmation email sent.
	 */
	changeEmail: {
		post: query(
			async (
				changeRequest: EmailChangeRequestInput,
			): Promise<ServerResultResponse<MessageResponseOutput>> => {
				try {
					const res = await fetchWithAuth(`${BASE_PATH}/change-email`, {
						body: JSON.stringify(
							v.parse(EmailChangeRequestSchema, changeRequest),
						),
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
			): Promise<ServerResultResponse<MessageResponseOutput>> => {
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
			): Promise<ServerResultResponse<MessageResponseOutput>> => {
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
				googleRequest: GoogleAuthRequestInput,
			): Promise<ServerResultResponse<AuthResponseOutput>> => {
				try {
					const res = await fetch(`${BASE_PATH}/google`, {
						body: JSON.stringify(
							v.parse(GoogleAuthRequestSchema, googleRequest),
						),
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
		post: query(async (): Promise<ServerResultResponse<AuthResponseOutput>> => {
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
		}, "AuthRpc.guest.post"),
	},

	/**
	 * Log in an existing user.
	 * @param loginRequest - The login credentials.
	 * @returns Auth tokens and user info on success.
	 */
	login: {
		post: query(
			async (
				loginRequest: UserLoginRequestInput,
			): Promise<ServerResultResponse<AuthResponseOutput>> => {
				try {
					const res = await fetch(`${BASE_PATH}/login`, {
						body: JSON.stringify(v.parse(UserLoginRequestSchema, loginRequest)),
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
			async (): Promise<ServerResultResponse<MessageResponseOutput>> => {
				try {
					const res = await fetchWithAuth(`${BASE_PATH}/logout`, {
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
		get: query(
			async (): Promise<ServerResultResponse<{ user: UserBaseOutput }>> => {
				try {
					const res = await fetchWithAuth(`${BASE_PATH}/me`, {
						method: "GET",
					});
					return {
						res: { user: v.parse(UserBaseSchema, (await res.json())["user"]) },
						success: true,
					};
				} catch (e) {
					return { err: coerceToError(e), success: false };
				}
			},
			"AuthRpc.me.get",
		),
	},

	/** Refresh the access token using the stored refresh token.
	 * This implementation reads the refresh token directly from sessionStorage
	 * and calls the backend refresh endpoint with it (as Authorization: Bearer <refresh>).
	 * Returns the new access token on success.
	 */
	refresh: {
		post: query(
			async (): Promise<ServerResultResponse<AccessTokenResponseOutput>> => {
				try {
					const refreshToken = sessionStorage.getItem("refreshToken");
					if (!refreshToken) {
						return {
							err: new Error("No refresh token available"),
							success: false,
						};
					}

					const res = await fetch(`${BASE_PATH}/refresh`, {
						headers: { Authorization: `Bearer ${refreshToken}` },
						method: "POST",
					});

					if (!res.ok) {
						// Bubble up a consistent error shape
						const text = await res.text().catch(() => "");
						return {
							err: new Error(`Refresh failed: ${res.status} ${text}`),
							success: false,
						};
					}

					const body = await res.json();
					return {
						res: v.parse(AccessTokenResponseSchema, body),
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
				registerRequest: UserRegisterRequestInput,
			): Promise<ServerResultResponse<AuthResponseOutput>> => {
				try {
					const res = await fetch(`${BASE_PATH}/register`, {
						body: JSON.stringify(
							v.parse(UserRegisterRequestSchema, registerRequest),
						),
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
				request: PasswordResetRequestInput,
			): Promise<ServerResultResponse<MessageResponseOutput>> => {
				try {
					const res = await fetch(`${BASE_PATH}/reset-password`, {
						body: JSON.stringify(v.parse(PasswordResetRequestSchema, request)),
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
				request: PasswordResetConfirmRequestInput,
			): Promise<ServerResultResponse<MessageResponseOutput>> => {
				try {
					const res = await fetch(
						`${BASE_PATH}/reset-password-confirm/${encodeURIComponent(token)}`,
						{
							body: JSON.stringify(
								v.parse(PasswordResetConfirmRequestSchema, request),
							),
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
