import type { UserUpdateRequest } from "@packages/shared-types";
import * as v from "valibot";
import { MatricNumberSchema } from "./credentials";
import { EmailSchema, NonEmptyStringSchema } from "./shared";

type UserUpdateRequestKeys = keyof UserUpdateRequest;

export const UserProfileSchema = v.object({
	avatar_url: v.pipe(v.string(), v.url()),
	email: EmailSchema,
	full_name: NonEmptyStringSchema,
	matric_no: MatricNumberSchema,
	username: NonEmptyStringSchema,
});
type _UserProfileInput = v.InferInput<typeof UserProfileSchema>;
type _UserProfileOutput = v.InferOutput<typeof UserProfileSchema>;
export type UserProfileInput =
	UserUpdateRequestKeys extends keyof _UserProfileInput
		? _UserProfileInput
		: never;
export type UserProfileOutput =
	UserUpdateRequestKeys extends keyof _UserProfileOutput
		? _UserProfileOutput
		: never;
