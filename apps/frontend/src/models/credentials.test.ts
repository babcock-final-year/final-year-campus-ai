import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { MatricNumberSchema } from "./credentials";

describe("MatricNumberSchema", () => {
	it("parses valid matric numbers", () => {
		const input = "22/0039";
		const output = v.parse(MatricNumberSchema, input);
		expect(output).toBe(input);
	});

	it("throws on invalid matric numbers", () => {
		const invalids = ["2/0039", "22-0039", "22/039", "", "22/abcd"];
		for (const s of invalids) {
			expect(() => v.parse(MatricNumberSchema, s)).toThrow();
		}
	});

	it("safeParse returns success true for valid and false for invalid", () => {
		const ok = v.safeParse(MatricNumberSchema, "21/4321");
		expect(ok.success).toBe(true);
		if (ok.success) expect(ok.output).toBe("21/4321");

		const bad = v.safeParse(MatricNumberSchema, "210/4321");
		expect(bad.success).toBe(false);
	});

	it("is acts as a runtime check/type guard", () => {
		expect(v.is(MatricNumberSchema, "00/0000")).toBe(true);
		expect(v.is(MatricNumberSchema, "00/000")).toBe(false);
		expect(v.is(MatricNumberSchema, 123)).toBe(false);
	});
});
