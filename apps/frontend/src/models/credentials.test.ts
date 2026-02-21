import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { MatricNumberSchema, SignInCredentialsSchema } from "./credentials";

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

describe("SignInCredentialsSchema", () => {
	it("parses valid credentials", () => {
		const input = { pass: "supersecret", user: "22/0039" };
		const output = v.parse(SignInCredentialsSchema, input);
		expect(output).toEqual(input);
	});

	it("throws on invalid credential shapes or values", () => {
		const invalids = [
			{ pass: "x", user: "2/0039" }, // invalid matric format
			{ pass: "x", user: "22-0039" }, // invalid matric format
			{ user: "22/0039" }, // missing pass
			{ pass: "secret" }, // missing user
			{ pass: "secret", user: 123 }, // wrong user type
		];
		for (const bad of invalids) {
			expect(() => v.parse(SignInCredentialsSchema, bad)).toThrow();
		}
	});

	it("is works as a runtime guard", () => {
		expect(v.is(SignInCredentialsSchema, { pass: "pw", user: "00/0000" })).toBe(
			true,
		);
		expect(v.is(SignInCredentialsSchema, { pass: "pw", user: "00/000" })).toBe(
			false,
		); // bad matric
		expect(v.is(SignInCredentialsSchema, { user: "00/0000" })).toBe(false); // missing pass
		expect(v.is(SignInCredentialsSchema, { pass: "pw" })).toBe(false); // missing user
	});
});
