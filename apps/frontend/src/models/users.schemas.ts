import * as v from "valibot";
import { MatricNumberSchema } from "./credentials";
import { EmailSchema } from "./shared";

/**
 * Schema for the request body of PUT /users/<user_id>
 */
export const UserUpdateRequestSchema = v.object({
	avatar_url: v.nullish(v.string()),
	full_name: v.nullish(v.string()),
	matric_no: v.nullish(MatricNumberSchema),
	username: v.nullish(v.string()),
});
export type UserUpdateRequestInput = v.InferInput<
	typeof UserUpdateRequestSchema
>;
export type UserUpdateRequestOutput = v.InferOutput<
	typeof UserUpdateRequestSchema
>;

export const UserBaseSchema = v.object({
	avatar_url: v.nullish(v.string()),
	email: EmailSchema,
	full_name: v.string(),
	id: v.pipe(v.unknown(), v.toString()),
	is_confirmed: v.nullish(v.boolean()),
	is_guest: v.nullish(v.boolean()),
	matric_no: v.nullish(MatricNumberSchema, "00/0000"),
	username: v.nullish(v.string(), "???"),
});
export type UserBaseInput = v.InferInput<typeof UserBaseSchema>;
export type UserBaseOutput = v.InferOutput<typeof UserBaseSchema>;

/**
 * Schema for the response of GET /users/<user_id>
 */
export const UserProfileResponseSchema = v.object({
	user: UserBaseSchema,
});
export type UserProfileResponseInput = v.InferInput<
	typeof UserProfileResponseSchema
>;
export type UserProfileResponseOutput = v.InferOutput<
	typeof UserProfileResponseSchema
>;

/**
 * Schema for the response of PUT /users/<user_id>
 * (returns updated user object)
 */
export const UserUpdateResponseSchema = UserBaseSchema;
export type UserUpdateResponseInput = v.InferInput<
	typeof UserUpdateResponseSchema
>;
export type UserUpdateResponseOutput = v.InferOutput<
	typeof UserUpdateResponseSchema
>;

/**
 * Schema for the response of POST /users/<user_id>/avatar
 */
export const AvatarUploadResponseSchema = v.object({
	avatar_url: v.string(),
	message: v.nullish(v.string()),
});
export type AvatarUploadResponseInput = v.InferInput<
	typeof AvatarUploadResponseSchema
>;
export type AvatarUploadResponseOutput = v.InferOutput<
	typeof AvatarUploadResponseSchema
>;
