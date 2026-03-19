import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { UserProfileSchema } from "./user-profile";

describe("UserProfileSchema", () => {
	it("parses valid input", () => {
		const input = {
			avatar_url: "https://example.com/avatar.png",
			email: "iceman8911@gmail.com",
			full_name: "John Doe",
			matric_no: "22/0039",
			username: "john",
		};
		const output = v.parse(UserProfileSchema, input);
		expect(output).toEqual(input);
	});

	it("throws when full_name is empty", () => {
		expect(() =>
			v.parse(UserProfileSchema, {
				avatar_url: "https://example.com/avatar.png",
				email: "iceman8911@gmail.com",
				full_name: "",
				matric_no: "22/0039",
				username: "john",
			}),
		).toThrow();
	});

	it("throws when username is empty", () => {
		expect(() =>
			v.parse(UserProfileSchema, {
				avatar_url: "https://example.com/avatar.png",
				email: "iceman8911@gmail.com",
				full_name: "John Doe",
				matric_no: "22/0039",
				username: "",
			}),
		).toThrow();
	});

	it("throws when matric_no is invalid", () => {
		const invalids = ["2/0039", "22-0039", "22/039", "", "22/abcd"];
		for (const matric_no of invalids) {
			expect(() =>
				v.parse(UserProfileSchema, {
					avatar_url: "https://example.com/avatar.png",
					email: "iceman8911@gmail.com",
					full_name: "John Doe",
					matric_no,
					username: "john",
				}),
			).toThrow();
		}
	});

	it("throws when avatar_url is not a valid URL", () => {
		const invalids = [
			"",
			"not-a-url",
			"/relative/path",
			"example.com/avatar.png",
		];
		for (const avatar_url of invalids) {
			expect(() =>
				v.parse(UserProfileSchema, {
					avatar_url,
					email: "iceman8911@gmail.com",
					full_name: "John Doe",
					matric_no: "22/0039",
					username: "john",
				}),
			).toThrow();
		}
	});

	it("safeParse returns success true for valid and false for invalid", () => {
		const ok = v.safeParse(UserProfileSchema, {
			avatar_url: "https://example.com/avatar.png",
			email: "iceman8911@gmail.com",
			full_name: "John Doe",
			matric_no: "22/0039",
			username: "john",
		});
		expect(ok.success).toBe(true);
		if (ok.success) expect(ok.output.username).toBe("john");

		const bad = v.safeParse(UserProfileSchema, {
			avatar_url: "https://example.com/avatar.png",
			email: "iceman8911@gmail.com",
			full_name: "",
			matric_no: "22/0039",
			username: "john",
		});
		expect(bad.success).toBe(false);
	});

	it("works as a runtime guard (v.is)", () => {
		expect(
			v.is(UserProfileSchema, {
				avatar_url: "https://example.com/avatar.png",
				email: "iceman8911@gmail.com",
				full_name: "John Doe",
				matric_no: "22/0039",
				username: "john",
			}),
		).toBe(true);

		expect(
			v.is(UserProfileSchema, {
				avatar_url: "not-a-url",
				email: "iceman8911@gmail.com",
				full_name: "John Doe",
				matric_no: "22/0039",
				username: "john",
			}),
		).toBe(false);

		expect(v.is(UserProfileSchema, "not-an-object")).toBe(false);
	});
});
