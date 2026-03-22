import * as v from "valibot";

export const SignUpSearchParamsSchema = v.object({
	verification_expired: v.optional(
		v.pipe(
			v.string(),
			v.toString(),
			v.transform<string, boolean>((arg) => {
				if (arg === "true") return true;
				else return false;
			}),
		),
		"false",
	),
});
export type SignUpSearchParamsInput = v.InferInput<
	typeof SignUpSearchParamsSchema
>;
export type SignUpSearchParamsOutput = v.InferOutput<
	typeof SignUpSearchParamsSchema
>;
