import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { NonEmptyStringSchema } from "./shared";

describe("NonEmptyStringSchema", () => {
	it("parses non-empty strings", () => {
		const input = "hello";
		const output = v.parse(NonEmptyStringSchema, input);
		expect(output).toBe(input);
	});

	it("throws on empty string or non-string values", () => {
		const invalids = ["", 0, null, undefined, {}, []];
		for (const bad of invalids) {
			expect(() => v.parse(NonEmptyStringSchema, bad)).toThrow();
		}
	});

	it("safeParse returns success true for valid and false for invalid", () => {
		const ok = v.safeParse(NonEmptyStringSchema, "a");
		expect(ok.success).toBe(true);
		if (ok.success) expect(ok.output).toBe("a");

		const bad = v.safeParse(NonEmptyStringSchema, "");
		expect(bad.success).toBe(false);
	});

	it("works as a runtime guard (v.is)", () => {
		expect(v.is(NonEmptyStringSchema, "some text")).toBe(true);
		expect(v.is(NonEmptyStringSchema, "")).toBe(false);
		expect(v.is(NonEmptyStringSchema, 123)).toBe(false);
	});
});
