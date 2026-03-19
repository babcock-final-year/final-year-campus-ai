import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
	AvatarUploadResponseSchema,
	UserBaseSchema,
	UserUpdateRequestSchema,
} from "./users.schemas";

describe("User Schemas", () => {
	it("validates UserBaseSchema", () => {
		const valid = {
			avatar_url: "https://example.com/avatar.png",
			email: "alice@example.com",
			full_name: "Alice Example",
			id: 42,
			is_confirmed: true,
			is_guest: false,
			matric_no: "U1234567",
			username: "alice",
		};
		expect(() => v.parse(UserBaseSchema, valid)).not.toThrow();
		// Missing required
		expect(() =>
			v.parse(UserBaseSchema, { ...valid, id: undefined }),
		).toThrow();
		// Invalid email
		expect(() => v.parse(UserBaseSchema, { ...valid, email: "bad" })).toThrow();
	});

	it("validates UserUpdateRequestSchema", () => {
		const valid = {
			avatar_url: "https://example.com/avatar2.png",
			full_name: "Bob Example",
			matric_no: "U7654321",
			username: "bob",
		};
		expect(() => v.parse(UserUpdateRequestSchema, valid)).not.toThrow();
		// All fields optional, so empty object is valid
		expect(() => v.parse(UserUpdateRequestSchema, {})).not.toThrow();
	});

	it("validates AvatarUploadResponseSchema", () => {
		const valid = {
			avatar_url: "https://example.com/avatar3.png",
			message: "Avatar uploaded successfully",
		};
		expect(() => v.parse(AvatarUploadResponseSchema, valid)).not.toThrow();
		// Missing avatar_url
		expect(() =>
			v.parse(AvatarUploadResponseSchema, { message: "ok" }),
		).toThrow();
	});
});
