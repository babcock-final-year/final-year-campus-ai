import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
	MatricNumberSchema,
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
	it("parses valid signup credentials (username + email + password)", () => {
		const input = {
			email: "alice@example.com",
			pass: "Secur3P@ss!",
			username: "alice",
		};
		const output = v.parse(SignUpCredentialsSchema, input);
		expect(output).toEqual(input);
	});

	it("throws on invalid signup shapes or values", () => {
		const invalids = [
			// password issues (same variants as sign-in)
			{ email: "a@b.com", pass: "x", username: "alice" },
			{ email: "a@b.com", pass: "nouppercase1!", username: "alice" },
			{ email: "a@b.com", pass: "NOLOWERCASE1!", username: "alice" },
			{ email: "a@b.com", pass: "NoNumber!!", username: "alice" },
			{ email: "a@b.com", pass: "NoSymbol11", username: "alice" },

			// email problems
			{ email: "not-an-email", pass: "Secur3P@ss!", username: "alice" },
			{ pass: "Secur3P@ss!", username: "alice" }, // missing email

			// username problems
			{ email: "alice@example.com", pass: "Secur3P@ss!" }, // missing username
			{ email: "alice@example.com", pass: "Secur3P@ss!", username: 123 }, // wrong username type
		];

		for (const bad of invalids) {
			expect(() => v.parse(SignUpCredentialsSchema, bad)).toThrow();
		}
	});

	it("safeParse and is behave as runtime checks", () => {
		const ok = v.safeParse(SignUpCredentialsSchema, {
			email: "carol@domain.test",
			pass: "Secur3P@ss!",
			username: "carol",
		});
		expect(ok.success).toBe(true);
		if (ok.success) expect(ok.output.username).toBe("carol");

		const badEmail = v.safeParse(SignUpCredentialsSchema, {
			email: "not-an-email",
			pass: "Secur3P@ss!",
			username: "carol",
		});
		expect(badEmail.success).toBe(false);

		expect(
			v.is(SignUpCredentialsSchema, {
				email: "dave@host.org",
				pass: "Secur3P@ss!",
				username: "dave",
			}),
		).toBe(true);

		expect(
			v.is(SignUpCredentialsSchema, {
				email: "dave@host.org",
				pass: "short",
				username: "dave",
			}),
		).toBe(false);

		expect(
			v.is(SignUpCredentialsSchema, {
				email: "dave@host.org",
				username: "dave",
			}),
		).toBe(false);
	});
});
