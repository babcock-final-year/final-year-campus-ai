import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
	ChatSummarySchema,
	ChatsListResponseSchema,
	DeleteResponseSchema,
	SearchResponseSchema,
} from "./history.schemas";

describe("History Schemas", () => {
	it("validates ChatSummarySchema", () => {
		const valid = {
			created_at: new Date().toISOString(),
			id: 1,
			title: "My Chat",
		};
		expect(() => v.parse(ChatSummarySchema, valid)).not.toThrow();
	});

	it("validates ChatsListResponseSchema", () => {
		const valid = {
			chats: [
				{
					created_at: new Date().toISOString(),
					id: 1,
					title: "Chat 1",
				},
				{
					created_at: new Date().toISOString(),
					id: 2,
					title: "Chat 2",
				},
			],
		};
		expect(() => v.parse(ChatsListResponseSchema, valid)).not.toThrow();
		// chats must be array
		expect(() => v.parse(ChatsListResponseSchema, { chats: {} })).toThrow();
		// Missing chats
		expect(() => v.parse(ChatsListResponseSchema, {})).toThrow();
	});

	it("validates DeleteResponseSchema", () => {
		expect(() =>
			v.parse(DeleteResponseSchema, { message: "All chats deleted" }),
		).not.toThrow();
		// Missing message
		expect(() => v.parse(DeleteResponseSchema, {})).toThrow();
		// Wrong type for message
		expect(() => v.parse(DeleteResponseSchema, { message: 123 })).toThrow();
	});

	it("validates SearchResponseSchema", () => {
		const valid = {
			results: [
				{
					content: "Hello",
					id: 1,
					is_liked: true,
					role: "user",
					timestamp: new Date().toISOString(),
				},
			],
		};
		expect(() => v.parse(SearchResponseSchema, valid)).not.toThrow();
		// results must be array
		expect(() => v.parse(SearchResponseSchema, { results: {} })).toThrow();
		// Missing results
		expect(() => v.parse(SearchResponseSchema, {})).toThrow();
	});
});
