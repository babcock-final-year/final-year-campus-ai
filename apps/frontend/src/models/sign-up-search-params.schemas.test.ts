import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
	type SignUpSearchParamsInput,
	SignUpSearchParamsSchema,
} from "./sign-up-search-params.schemas";

describe("SignUpSearchParamsSchema", () => {
	it("should accept missing arguments and use defaults", () => {
		const input = {} as const satisfies SignUpSearchParamsInput;

		expect(v.parse(SignUpSearchParamsSchema, input)).toStrictEqual({
			verification_expired: false,
		});
	});

	it("should accept string arguments and coerce them", () => {
		const input = {
			verification_expired: "false",
		} as const satisfies SignUpSearchParamsInput;
		const input2 = {
			verification_expired: "true",
		} as const satisfies SignUpSearchParamsInput;

		expect(v.parse(SignUpSearchParamsSchema, input)).toStrictEqual({
			verification_expired: false,
		});
		expect(v.parse(SignUpSearchParamsSchema, input2)).toStrictEqual({
			verification_expired: true,
		});
	});
});
