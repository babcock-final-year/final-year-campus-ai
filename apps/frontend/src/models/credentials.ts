import * as v from "valibot";
import {
	LOWER_CASE_REGEX,
	MATRIC_NUMBER_REGEX,
	NUMBER_REGEX,
	SYMBOL_REGEX,
	UPPER_CASE_REGEX,
} from "~/constants/regex";
import { NonEmptyStringSchema } from "./shared";

export const MatricNumberSchema = v.pipe(
	v.string("Matric number must be a string"),
	v.regex(
		MATRIC_NUMBER_REGEX,
		"Matric number must be in a format like '22/0039', '21/3134', etc",
	),
	v.transform((str) => str as `${number}/${number}`),
);
export type MatricNumberInput = v.InferInput<typeof MatricNumberSchema>;
export type MatricNumberOutput = v.InferOutput<typeof MatricNumberSchema>;

export const PasswordSchema = v.pipe(
	NonEmptyStringSchema,
	v.minLength(10, "Password too short."),
	v.maxLength(31, "Password too long."),
	v.regex(UPPER_CASE_REGEX, "Password must have an uppercase character."),
	v.regex(LOWER_CASE_REGEX, "Password must have a lowercase character."),
	v.regex(NUMBER_REGEX, "Password must have a number."),
	v.regex(SYMBOL_REGEX, "Password must have a non-alphanumeric character."),
);

export const SignInCredentialsSchema = v.object({
	pass: PasswordSchema,
	/** Username or email :p */
	user: NonEmptyStringSchema,
});
export type SignInCredentialsInput = v.InferInput<
	typeof SignInCredentialsSchema
>;
export type SignInCredentialsOutput = v.InferOutput<
	typeof SignInCredentialsSchema
>;
