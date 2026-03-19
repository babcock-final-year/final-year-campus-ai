import { query } from "@solidjs/router";
import * as v from "valibot";
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

/**
 * UsersRpc provides type-safe, ergonomic methods for all user-related backend routes.
 * Each method abstracts fetch, validates with valibot, and returns a ServerResultResponse.
 */
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
				userId: number | string,
				file: File | Blob,
			): Promise<ServerResultResponse<AvatarUploadResponseOutput>> => {
				try {
					const formData = new FormData();
					formData.append("avatar", file);
					const res = await fetch(
						`${getClientEnv().VITE_BACKEND_BASE_URL}/users/${encodeURIComponent(String(userId))}/avatar`,
						{
							body: formData,
							credentials: "include",
							method: "POST",
						},
					);

					return {
						res: v.parse(AvatarUploadResponseSchema, await res.json()),
						success: true,
					};
				} catch (e) {
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
			userId: number | string,
		): Promise<ServerResultResponse<UserProfileResponseOutput>> => {
			try {
				const res = await fetch(
					`${getClientEnv().VITE_BACKEND_BASE_URL}/users/${encodeURIComponent(String(userId))}`,
					{
						credentials: "include",
						method: "GET",
					},
				);
				return {
					res: v.parse(UserProfileResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
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
			userId: number | string,
			updateRequest: UserUpdateRequestInput,
		): Promise<ServerResultResponse<UserUpdateResponseOutput>> => {
			try {
				const res = await fetch(
					`${getClientEnv().VITE_BACKEND_BASE_URL}/users/${encodeURIComponent(String(userId))}`,
					{
						body: JSON.stringify(
							v.parse(UserUpdateRequestSchema, updateRequest),
						),
						credentials: "include",
						headers: { "Content-Type": "application/json" },
						method: "PUT",
					},
				);
				return {
					res: v.parse(UserUpdateResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
		"UsersRpc.put",
	),
} as const;

export default UsersRpc;
