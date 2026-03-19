import * as v from "valibot";
import { EmailSchema } from "./shared";

/**
 * Schema for the request body of PUT /users/<user_id>
 */
export const UserUpdateRequestSchema = v.object({
	avatar_url: v.optional(v.string()),
	full_name: v.optional(v.string()),
	matric_no: v.optional(v.string()),
	username: v.optional(v.string()),
});

/**
 * Schema for the response user object (public profile)
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

/**
 * Schema for the response of GET /users/<user_id>
 */
export const UserProfileResponseSchema = v.object({
	user: UserBaseSchema,
});

/**
 * Schema for the response of PUT /users/<user_id>
 * (returns updated user object)
 */
export const UserUpdateResponseSchema = UserBaseSchema;

/**
 * Schema for the response of POST /users/<user_id>/avatar
 */
export const AvatarUploadResponseSchema = v.object({
	avatar_url: v.string(),
	message: v.optional(v.string()),
});
