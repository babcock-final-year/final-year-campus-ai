import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
	MatricNumberSchema,
	SendPasswordResetLinkSchema,
	SignInCredentialsSchema,
	SignUpCredentialsSchema,
} from "./credentials";

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

	it("acts as a runtime check/type guard", () => {
		expect(v.is(MatricNumberSchema, "00/0000")).toBe(true);
		expect(v.is(MatricNumberSchema, "00/000")).toBe(false);
		expect(v.is(MatricNumberSchema, 123)).toBe(false);
	});
});

describe("SignInCredentialsSchema", () => {
	it("parses valid credentials (generic username + password)", () => {
		// password meets complexity: >=10 chars, uppercase, lowercase, digit, symbol
		const input = { pass: "Secur3P@ss!", user: "alice" };
		const output = v.parse(SignInCredentialsSchema, input);
		expect(output).toEqual(input);
	});

	it("throws on invalid credential shapes or values", () => {
		const invalids = [
			{ pass: "x", user: "alice" }, // too short / lacks complexity
			{ pass: "nouppercase1!", user: "alice" }, // missing uppercase
			{ pass: "NOLOWERCASE1!", user: "alice" }, // missing lowercase
			{ pass: "NoNumber!!", user: "alice" }, // missing number
			{ pass: "NoSymbol11", user: "alice" }, // missing symbol
			{ user: "alice" }, // missing pass
			{ pass: "Secur3P@ss!" }, // missing user
			{ pass: "Secur3P@ss!", user: 123 }, // wrong user type
		];
		for (const bad of invalids) {
			expect(() => v.parse(SignInCredentialsSchema, bad)).toThrow();
		}
	});

	it("works as a runtime guard", () => {
		expect(
			v.is(SignInCredentialsSchema, { pass: "Secur3P@ss!", user: "bob" }),
		).toBe(true);

		// invalid password (too short / lacks complexity)
		expect(
			v.is(SignInCredentialsSchema, { pass: "short1!", user: "bob" }),
		).toBe(false);

		// missing fields
		expect(v.is(SignInCredentialsSchema, { user: "bob" })).toBe(false);
		expect(v.is(SignInCredentialsSchema, { pass: "Secur3P@ss!" })).toBe(false);
	});
});

describe("SignUpCredentialsSchema", () => {
	it("parses valid signup credentials (username + email + password + confirmPass)", () => {
		const input = {
			confirmPass: "Secur3P@ss!",
			email: "alice@example.com",
			pass: "Secur3P@ss!",
			username: "alice",
		};
		const output = v.parse(SignUpCredentialsSchema, input);
		// Output should not include confirmPass due to transform
		expect(output).toEqual({
			email: "alice@example.com",
			pass: "Secur3P@ss!",
			username: "alice",
		});
	});

	it("throws when pass and confirmPass do not match", () => {
		const input = {
			confirmPass: "WrongP@ssword1",
			email: "bob@example.com",
			pass: "Secur3P@ss!",
			username: "bob",
		};
		expect(() => v.parse(SignUpCredentialsSchema, input)).toThrow();
	});

	it("throws on invalid signup shapes or values", () => {
		const invalids = [
			// password issues
			{ confirmPass: "x", email: "a@b.com", pass: "x", username: "alice" },
			{
				confirmPass: "nouppercase1!",
				email: "a@b.com",
				pass: "nouppercase1!",
				username: "alice",
			},
			{
				confirmPass: "NOLOWERCASE1!",
				email: "a@b.com",
				pass: "NOLOWERCASE1!",
				username: "alice",
			},
			{
				confirmPass: "NoNumber!!",
				email: "a@b.com",
				pass: "NoNumber!!",
				username: "alice",
			},
			{
				confirmPass: "NoSymbol11",
				email: "a@b.com",
				pass: "NoSymbol11",
				username: "alice",
			},

			// email problems
			{
				confirmPass: "Secur3P@ss!",
				email: "not-an-email",
				pass: "Secur3P@ss!",
				username: "alice",
			},
			{ confirmPass: "Secur3P@ss!", pass: "Secur3P@ss!", username: "alice" }, // missing email

			// username problems
			{
				confirmPass: "Secur3P@ss!",
				email: "alice@example.com",
				pass: "Secur3P@ss!",
			}, // missing username
			{
				confirmPass: "Secur3P@ss!",
				email: "alice@example.com",
				pass: "Secur3P@ss!",
				username: 123,
			}, // wrong username type

			// mismatched passwords
			{
				confirmPass: "WrongP@ssword1",
				email: "alice@example.com",
				pass: "Secur3P@ss!",
				username: "alice",
			},

			// missing confirmPass
			{ email: "alice@example.com", pass: "Secur3P@ss!", username: "alice" },
		];

		for (const bad of invalids) {
			expect(() => v.parse(SignUpCredentialsSchema, bad)).toThrow();
		}
	});

	it("safeParse and is behave as runtime checks", () => {
		const ok = v.safeParse(SignUpCredentialsSchema, {
			confirmPass: "Secur3P@ss!",
			email: "carol@domain.test",
			pass: "Secur3P@ss!",
			username: "carol",
		});
		expect(ok.success).toBe(true);
		if (ok.success) {
			expect(ok.output.username).toBe("carol");
			expect(ok.output).not.toHaveProperty("confirmPass");
		}

		const badEmail = v.safeParse(SignUpCredentialsSchema, {
			confirmPass: "Secur3P@ss!",
			email: "not-an-email",
			pass: "Secur3P@ss!",
			username: "carol",
		});
		expect(badEmail.success).toBe(false);

		const badConfirm = v.safeParse(SignUpCredentialsSchema, {
			confirmPass: "WrongP@ssword1",
			email: "carol@domain.test",
			pass: "Secur3P@ss!",
			username: "carol",
		});
		expect(badConfirm.success).toBe(false);

		expect(
			v.is(SignUpCredentialsSchema, {
				confirmPass: "Secur3P@ss!",
				email: "dave@host.org",
				pass: "Secur3P@ss!",
				username: "dave",
			}),
		).toBe(true);

		expect(
			v.is(SignUpCredentialsSchema, {
				confirmPass: "short",
				email: "dave@host.org",
				pass: "short",
				username: "dave",
			}),
		).toBe(false);

		expect(
			v.is(SignUpCredentialsSchema, {
				email: "dave@host.org",
				pass: "Secur3P@ss!",
				username: "dave",
			}),
		).toBe(false);

		expect(
			v.is(SignUpCredentialsSchema, {
				confirmPass: "WrongP@ssword1",
				email: "dave@host.org",
				pass: "Secur3P@ss!",
				username: "dave",
			}),
		).toBe(false);
	});
});

describe("SendPasswordResetLinkSchema", () => {
	it("parses valid email objects", () => {
		const input = { email: "alice@example.com" };
		const output = v.parse(SendPasswordResetLinkSchema, input);
		expect(output).toEqual(input);
	});

	it("parses various valid email formats", () => {
		const validInputs = [
			{ email: "user@domain.com" },
			{ email: "bob.smith@example.org" },
			{ email: "contact+tag@company.net" },
			{ email: "test123@test.co.uk" },
		];
		for (const input of validInputs) {
			const output = v.parse(SendPasswordResetLinkSchema, input);
			expect(output).toEqual(input);
		}
	});

	it("throws on invalid email addresses", () => {
		const invalids = [
			{ email: "" }, // empty email
			{ email: "notanemail" }, // no @ or domain
			{ email: "user@" }, // missing domain
			{ email: "@example.com" }, // missing local part
			{ email: "user@.com" }, // missing domain name
			{ email: "user name@example.com" }, // space in local part
			{ email: "user@exam ple.com" }, // space in domain
		];
		for (const bad of invalids) {
			expect(() => v.parse(SendPasswordResetLinkSchema, bad)).toThrow();
		}
	});

	it("throws on missing or invalid fields", () => {
		const invalids = [
			{}, // missing email field
			{ email: 123 }, // wrong email type
			{ email: null }, // null email
			{ email: undefined }, // undefined email
			{ email: { nested: "object" } }, // email as object
			{ email: ["array"] }, // email as array
		];
		for (const bad of invalids) {
			expect(() => v.parse(SendPasswordResetLinkSchema, bad)).toThrow();
		}
	});

	it("safeParse returns success true for valid and false for invalid", () => {
		const ok = v.safeParse(SendPasswordResetLinkSchema, {
			email: "valid@example.com",
		});
		expect(ok.success).toBe(true);
		if (ok.success) {
			expect(ok.output.email).toBe("valid@example.com");
		}

		const bad = v.safeParse(SendPasswordResetLinkSchema, {
			email: "invalid-email",
		});
		expect(bad.success).toBe(false);

		const missing = v.safeParse(SendPasswordResetLinkSchema, {});
		expect(missing.success).toBe(false);

		const empty = v.safeParse(SendPasswordResetLinkSchema, {
			email: "",
		});
		expect(empty.success).toBe(false);
	});

	it("works as a runtime guard (v.is)", () => {
		expect(
			v.is(SendPasswordResetLinkSchema, { email: "user@domain.com" }),
		).toBe(true);

		expect(
			v.is(SendPasswordResetLinkSchema, { email: "another@test.org" }),
		).toBe(true);

		expect(v.is(SendPasswordResetLinkSchema, { email: "invalid-email" })).toBe(
			false,
		);

		expect(v.is(SendPasswordResetLinkSchema, { email: "" })).toBe(false);

		expect(v.is(SendPasswordResetLinkSchema, {})).toBe(false);

		expect(v.is(SendPasswordResetLinkSchema, "not-an-object")).toBe(false);
	});
});
