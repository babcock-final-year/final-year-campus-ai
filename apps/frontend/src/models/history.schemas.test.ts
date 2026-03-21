import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { ChatSummarySchema, ChatsListResponseSchema } from "./history.schemas";

describe("History Schemas", () => {
	it("validates ChatSummarySchema", () => {
		const valid = {
			id: 1,
			title: "My Chat",
		};
		expect(() => v.parse(ChatSummarySchema, valid)).not.toThrow();
		// Missing required field
		expect(() =>
			v.parse(ChatSummarySchema, { ...valid, id: undefined }),
		).toThrow();
	});

	it("validates ChatsListResponseSchema", () => {
		const valid = {
			chats: [
				{
					id: 1,
					title: "Chat 1",
				},
				{
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
