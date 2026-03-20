import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
	AccessTokenResponseSchema,
	AuthResponseSchema,
	EmailChangeRequestSchema,
	GoogleAuthRequestSchema,
	MessageResponseSchema,
	PasswordResetConfirmRequestSchema,
	PasswordResetRequestSchema,
	UserLoginRequestSchema,
	UserRegisterRequestSchema,
} from "./auth.schemas";
import { UserBaseSchema } from "./users.schemas";

describe("Auth Schemas", () => {
	it("validates UserRegisterRequestSchema", () => {
		const valid = {
			email: "jane@example.com",
			full_name: "Jane Doe",
			password: "securepassword123",
		};
		expect(() => v.parse(UserRegisterRequestSchema, valid)).not.toThrow();

		// Invalid email
		expect(() =>
			v.parse(UserRegisterRequestSchema, { ...valid, email: "not-an-email" }),
		).toThrow();
	});

	it("validates UserLoginRequestSchema", () => {
		const valid = {
			email: "john@example.com",
			password: "pw",
		};
		expect(() => v.parse(UserLoginRequestSchema, valid)).not.toThrow();
		expect(() =>
			v.parse(UserLoginRequestSchema, { ...valid, email: "bad" }),
		).toThrow();
	});

	it("validates GoogleAuthRequestSchema", () => {
		expect(() =>
			v.parse(GoogleAuthRequestSchema, { token: "sometoken" }),
		).not.toThrow();
		expect(() => v.parse(GoogleAuthRequestSchema, {})).toThrow();
	});

	it("validates EmailChangeRequestSchema", () => {
		expect(() =>
			v.parse(EmailChangeRequestSchema, {
				new_email: "a@b.com",
				password: "pw",
			}),
		).not.toThrow();
		expect(() =>
			v.parse(EmailChangeRequestSchema, { new_email: "bad", password: "pw" }),
		).toThrow();
	});

	it("validates PasswordResetConfirmRequestSchema", () => {
		expect(() =>
			v.parse(PasswordResetConfirmRequestSchema, { new_password: "pw" }),
		).not.toThrow();
		expect(() => v.parse(PasswordResetConfirmRequestSchema, {})).toThrow();
	});

	it("validates UserBaseSchema", () => {
		const valid = {
			avatar_url: "http://example.com/avatar.png",
			email: "jane@example.com",
			full_name: "Jane Doe",
			id: "1",
			is_confirmed: true,
			is_guest: false,
			matric_no: "A12345",
			username: "jane",
		};
		expect(() => v.parse(UserBaseSchema, valid)).not.toThrow();
		// Missing required
		expect(() =>
			v.parse(UserBaseSchema, { ...valid, id: undefined }),
		).toThrow();
	});

	it("validates AuthResponseSchema", () => {
		const valid = {
			access_token: "token",
			refresh_token: "refresh",
			user: {
				email: "jane@example.com",
				full_name: "Jane Doe",
				id: "1",
				username: "jane",
			},
		};
		expect(() => v.parse(AuthResponseSchema, valid)).not.toThrow();
		// Missing user
		expect(() =>
			v.parse(AuthResponseSchema, { ...valid, user: undefined }),
		).toThrow();
	});

	it("validates MessageResponseSchema", () => {
		expect(() =>
			v.parse(MessageResponseSchema, { message: "ok" }),
		).not.toThrow();
		expect(() => v.parse(MessageResponseSchema, {})).toThrow();
	});

	it("validates AccessTokenResponseSchema", () => {
		expect(() =>
			v.parse(AccessTokenResponseSchema, { access_token: "token" }),
		).not.toThrow();
		expect(() => v.parse(AccessTokenResponseSchema, {})).toThrow();
	});

	it("validates PasswordResetRequestSchema", () => {
		expect(() =>
			v.parse(PasswordResetRequestSchema, { email: "a@b.com" }),
		).not.toThrow();
		expect(() =>
			v.parse(PasswordResetRequestSchema, { email: "bad" }),
		).toThrow();
	});
});
