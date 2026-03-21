import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { EmailSchema, NonEmptyStringSchema } from "./shared";

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

describe("EmailSchema", () => {
	it("parses valid email addresses", () => {
		const validEmails = [
			"alice@example.com",
			"bob.smith@domain.org",
			"user+tag@test.co.uk",
			"contact123@company.net",
			"test.email-with-dash@example.com",
		];
		for (const email of validEmails) {
			const output = v.parse(EmailSchema, email);
			expect(output).toBe(email);
		}
	});

	it("throws on invalid email addresses", () => {
		const invalidEmails = [
			"", // empty string
			"notanemail", // no @ or domain
			"user@", // missing domain
			"@example.com", // missing local part
			"user@.com", // missing domain name
			"user name@example.com", // space in local part
			"user@example", // missing TLD
			"user@@example.com", // double @
			"user@exam ple.com", // space in domain
		];
		for (const email of invalidEmails) {
			expect(() => v.parse(EmailSchema, email)).toThrow();
		}
	});

	it("throws on non-string values", () => {
		const invalids = [123, null, undefined, {}, [], true];
		for (const bad of invalids) {
			expect(() => v.parse(EmailSchema, bad)).toThrow();
		}
	});

	it("safeParse returns success true for valid and false for invalid", () => {
		const ok = v.safeParse(EmailSchema, "valid@example.com");
		expect(ok.success).toBe(true);
		if (ok.success) expect(ok.output).toBe("valid@example.com");

		const bad = v.safeParse(EmailSchema, "invalid-email");
		expect(bad.success).toBe(false);

		const empty = v.safeParse(EmailSchema, "");
		expect(empty.success).toBe(false);
	});

	it("works as a runtime guard (v.is)", () => {
		expect(v.is(EmailSchema, "user@domain.com")).toBe(true);
		expect(v.is(EmailSchema, "another.email@test.org")).toBe(true);
		expect(v.is(EmailSchema, "invalid-email")).toBe(false);
		expect(v.is(EmailSchema, "")).toBe(false);
		expect(v.is(EmailSchema, "user@")).toBe(false);
		expect(v.is(EmailSchema, 123)).toBe(false);
	});
});
