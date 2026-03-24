import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
	ComplaintCreateRequestSchema,
	ComplaintListResponseSchema,
	ComplaintResponseSchema,
} from "./complaint.schemas";

describe("Complaint Schemas", () => {
	it("validates ComplaintCreateRequestSchema", () => {
		const valid = {
			description: "The air conditioner in room 101 is not working.",
			title: "Broken AC",
		};
		expect(() => v.parse(ComplaintCreateRequestSchema, valid)).not.toThrow();
		// Missing title
		expect(() =>
			v.parse(ComplaintCreateRequestSchema, { description: "desc" }),
		).toThrow();
		// Missing description
		expect(() =>
			v.parse(ComplaintCreateRequestSchema, { title: "title" }),
		).toThrow();
		// Title must be string
		expect(() =>
			v.parse(ComplaintCreateRequestSchema, {
				description: "desc",
				title: 123,
			}),
		).toThrow();
	});

	it("validates ComplaintResponseSchema", () => {
		const valid = {
			created_at: "2024-01-01T12:00:00Z",
			description: "Pipe leaking in the bathroom.",
			id: 1,
			status: "open",
			title: "Leaking pipe",
			user_id: 2,
		};
		expect(() => v.parse(ComplaintResponseSchema, valid)).not.toThrow();
		// Invalid created_at
		expect(() =>
			v.parse(ComplaintResponseSchema, { ...valid, created_at: 123 }),
		).toThrow();
	});

	it("validates ComplaintListResponseSchema", () => {
		const valid = {
			complaints: [
				{
					created_at: "2024-01-01T12:00:00Z",
					description: "Pipe leaking in the bathroom.",
					id: 1,
					status: "open",
					title: "Leaking pipe",
					user_id: 2,
				},
				{
					created_at: "2024-01-02T09:30:00Z",
					description: "Window in room 202 is broken.",
					id: 2,
					status: "closed",
					title: "Broken window",
					user_id: 3,
				},
			],
		};
		expect(() => v.parse(ComplaintListResponseSchema, valid)).not.toThrow();
		// complaints must be array
		expect(() =>
			v.parse(ComplaintListResponseSchema, { complaints: {} }),
		).toThrow();
		// Missing complaints
		expect(() => v.parse(ComplaintListResponseSchema, {})).toThrow();
	});
});
