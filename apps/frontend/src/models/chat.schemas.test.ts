import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
	ChatCreateRequestSchema,
	ChatCreateResponseSchema,
	ChatHistoryResponseSchema,
	ChatMessageRequestSchema,
	ChatMessageResponseSchema,
} from "./chat.schemas";

describe("Chat Schemas", () => {
	it("validates ChatCreateRequestSchema", () => {
		expect(() =>
			v.parse(ChatCreateRequestSchema, { title: "My chat" }),
		).not.toThrow();
		// Title is optional
		expect(() => v.parse(ChatCreateRequestSchema, {})).not.toThrow();
		// Title must be string if present
		expect(() => v.parse(ChatCreateRequestSchema, { title: 123 })).toThrow();
	});

	it("validates ChatCreateResponseSchema", () => {
		const valid = { chat_id: 1, title: "Chat Title" };
		expect(() => v.parse(ChatCreateResponseSchema, valid)).not.toThrow();
		// Missing chat_id
		expect(() =>
			v.parse(ChatCreateResponseSchema, { title: "Chat Title" }),
		).toThrow();
		// chat_id must be number
		expect(() =>
			v.parse(ChatCreateResponseSchema, {
				chat_id: "bad",
				title: "Chat Title",
			}),
		).toThrow();
	});

	it("validates ChatMessageRequestSchema", () => {
		expect(() =>
			v.parse(ChatMessageRequestSchema, { content: "Hello" }),
		).not.toThrow();
		// Missing content
		expect(() => v.parse(ChatMessageRequestSchema, {})).toThrow();
		// Content must be string
		expect(() => v.parse(ChatMessageRequestSchema, { content: 123 })).toThrow();
	});

	it("validates ChatMessageResponseSchema", () => {
		const valid = {
			chat_id: 2,
			content: "Hi",
			id: 1,
			role: "assistant",
			timestamp: "2024-01-01T00:00:00Z",
		};
		expect(() => v.parse(ChatMessageResponseSchema, valid)).not.toThrow();
		// Missing required
		expect(() =>
			v.parse(ChatMessageResponseSchema, { ...valid, id: undefined }),
		).toThrow();
		// Invalid role
		expect(() =>
			v.parse(ChatMessageResponseSchema, { ...valid, role: "invalid" }),
		).toThrow();
	});

	it("validates ChatHistoryResponseSchema", () => {
		const valid = {
			chat_id: 1,
			messages: [
				{
					chat_id: 1,
					content: "Hello",
					id: 1,
					role: "user",
					timestamp: "2024-01-01T00:00:00Z",
				},
				{
					chat_id: 1,
					content: "Hi there!",
					id: 2,
					role: "assistant",
					timestamp: "2024-01-01T00:01:00Z",
				},
			],
			title: "Chat",
		};
		expect(() => v.parse(ChatHistoryResponseSchema, valid)).not.toThrow();
		// messages must be array
		expect(() =>
			v.parse(ChatHistoryResponseSchema, { ...valid, messages: {} }),
		).toThrow();
		// Missing chat_id
		expect(() =>
			v.parse(ChatHistoryResponseSchema, { ...valid, chat_id: undefined }),
		).toThrow();
	});
});
