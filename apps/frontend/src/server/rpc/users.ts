"use server";
import * as v from "valibot";
import { SERVER_ENV } from "~/constants/env";
import {
	AvatarUploadResponseSchema,
	UserBaseSchema,
	UserProfileResponseSchema,
	type UserUpdateRequestSchema,
	UserUpdateResponseSchema,
} from "~/models/users.schemas";
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
		async post(
			userId: number | string,
			formData: FormData,
		): Promise<
			ServerResultResponse<v.InferOutput<typeof AvatarUploadResponseSchema>>
		> {
			try {
				// Extract the file/blob from the FormData (key: 'file')
				const file = formData.get("file");
				if (!(file instanceof File)) {
					return {
						err: coerceToError(
							"FormData must include a 'file' entry of type File or Blob.",
						),
						success: false,
					};
				}

				// Re-encode as FormData with correct backend key
				const backendFormData = new FormData();
				backendFormData.append("avatar", file);
				const res = await fetch(
					`${SERVER_ENV.BACKEND_BASE_URL}/users/${encodeURIComponent(String(userId))}/avatar`,
					{
						body: backendFormData,
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
	},
	/**
	 * Fetch a public user profile by user ID.
	 * @param userId - The user's unique identifier.
	 * @returns The user's public profile.
	 */
	async get(
		userId: number | string,
	): Promise<
		ServerResultResponse<v.InferOutput<typeof UserProfileResponseSchema>>
	> {
		try {
			const res = await fetch(
				`${SERVER_ENV.BACKEND_BASE_URL}/users/${encodeURIComponent(String(userId))}`,
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

	/**
	 * Update editable fields on the user's profile.
	 * @param userId - The user's unique identifier.
	 * @param updateRequest - The fields to update (all optional).
	 * @returns The updated user object.
	 */
	async put(
		userId: number | string,
		updateRequest: v.InferInput<typeof UserUpdateRequestSchema>,
	): Promise<
		ServerResultResponse<v.InferOutput<typeof UserUpdateResponseSchema>>
	> {
		try {
			const res = await fetch(
				`${SERVER_ENV.BACKEND_BASE_URL}/users/${encodeURIComponent(String(userId))}`,
				{
					body: JSON.stringify(updateRequest),
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
} as const;

export default UsersRpc;
