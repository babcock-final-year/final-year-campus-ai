import * as v from "valibot";
import { MATRIC_NUMBER_REGEX } from "~/constants/regex";

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
