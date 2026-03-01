import * as v from "valibot";

export const NonEmptyStringSchema = v.pipe(
	v.string(),
	v.minLength(1, "An empty string is not allowed."),
);

export const EmailSchema = v.pipe(NonEmptyStringSchema, v.email());
