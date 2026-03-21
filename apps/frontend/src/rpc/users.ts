import { query } from "@solidjs/router";
import * as v from "valibot";
import { useToastContext } from "~/context/ToastContextProvider";
import {
	type AvatarUploadResponseOutput,
	AvatarUploadResponseSchema,
	type UserProfileResponseOutput,
	UserProfileResponseSchema,
	type UserUpdateRequestInput,
	UserUpdateRequestSchema,
	type UserUpdateResponseOutput,
	UserUpdateResponseSchema,
} from "~/models/users.schemas";
import { getClientEnv } from "~/utils/env";
import { coerceToError } from "~/utils/error";
import type { ServerResultResponse } from "./_shared";
import fetchWithAuth from "./fetchWithAuth";

/**
 * UsersRpc provides type-safe, ergonomic methods for all user-related backend routes.
 * Each method abstracts fetch, validates with valibot, and returns a ServerResultResponse.
 *
 * Note: We attempt to show an error toast when an RPC fails. The toast call is wrapped
 * in a try/catch because these RPC functions can be invoked outside of a Solid render
 * context where the toast context may not be available. If the toast context isn't
 * available we silently fall back to just returning the error response.
 */

const BASE_PATH =
	`${getClientEnv().VITE_BACKEND_BASE_URL}/api/v1/users` as const;

function tryShowToast(title: string, e: unknown) {
	try {
		// useToastContext may throw if called outside of a provider / Solid render context.
		const toast = useToastContext();
		const err = coerceToError(e);
		toast.showToast({
			class: { alert: "alert-error", closeBtn: "btn-error" },
			description: err.message ?? "Unknown error",
			title,
		});
	} catch (toastErr) {
		// If we can't show a toast (no provider / outside reactive root), log to console and continue.
		// We intentionally avoid throwing here so RPCs still return the standard ServerResultResponse.
		// eslint-disable-next-line no-console
		console.error("Unable to show toast for RPC error:", toastErr);
	}
}

const UsersRpc = {
	/**
	 * Upload a new avatar for the user.
	 * @param userId - The user's unique identifier.
	 * @param formData - FormData with a single entry: key 'file', value File\.
	 * @returns The new avatar URL and optional message.
	 */
	avatar: {
		post: query(
			async (
				userId: string,
				file: File | Blob,
			): Promise<ServerResultResponse<AvatarUploadResponseOutput>> => {
				try {
					const formData = new FormData();
					formData.append("avatar", file);
					const res = await fetchWithAuth(
						`${BASE_PATH}/${encodeURIComponent(userId)}/avatar`,
						{ body: formData, method: "POST" },
					);

					return {
						res: v.parse(AvatarUploadResponseSchema, await res.json()),
						success: true,
					};
				} catch (e) {
					tryShowToast("Avatar upload failed", e);
					return { err: coerceToError(e), success: false };
				}
			},
			"UsersRpc.avatar.post",
		),
	},
	/**
	 * Fetch a public user profile by user ID.
	 * @param userId - The user's unique identifier.
	 * @returns The user's public profile.
	 */
	get: query(
		async (
			userId: string,
		): Promise<ServerResultResponse<UserProfileResponseOutput>> => {
			try {
				const res = await fetchWithAuth(
					`${BASE_PATH}/${encodeURIComponent(userId)}`,
					{ method: "GET" },
				);
				return {
					res: v.parse(UserProfileResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				tryShowToast("Failed to fetch user profile", e);
				return { err: coerceToError(e), success: false };
			}
		},
		"UsersRpc.get",
	),

	/**
	 * Update editable fields on the user's profile.
	 * @param userId - The user's unique identifier.
	 * @param updateRequest - The fields to update (all optional).
	 * @returns The updated user object.
	 */
	put: query(
		async (
			userId: string,
			updateRequest: UserUpdateRequestInput,
		): Promise<ServerResultResponse<UserUpdateResponseOutput>> => {
			try {
				const res = await fetchWithAuth(
					`${BASE_PATH}/${encodeURIComponent(userId)}`,
					{
						body: JSON.stringify(
							v.parse(UserUpdateRequestSchema, updateRequest),
						),
						headers: { "Content-Type": "application/json" },
						method: "PUT",
					},
				);
				return {
					res: v.parse(UserUpdateResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				tryShowToast("Failed to update profile", e);
				return { err: coerceToError(e), success: false };
			}
		},
		"UsersRpc.put",
	),
} as const;

export default UsersRpc;
