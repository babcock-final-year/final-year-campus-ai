import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { ChatSummarySchema, ChatsListResponseSchema } from "./history.schemas";

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
});
