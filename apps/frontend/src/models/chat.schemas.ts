import * as v from "valibot";
import { UserBaseSchema } from "./users.schemas";

/**
 * Schema for the request body of POST /chat
 */
export const ChatCreateRequestSchema = v.object({
	title: v.optional(v.string()),
});

/**
 * Schema for the response of POST /chat
 */
export const ChatCreateResponseSchema = v.object({
	chat_id: v.number(),
	title: v.string(),
});

/**
 * Schema for a single chat message (user or assistant)
 */
export const ChatMessageSchema = v.object({
	chat_id: v.number(),
	content: v.string(),
	id: v.number(),
	role: v.union([v.literal("user"), v.literal("assistant")]),
	timestamp: v.string(), // ISO string
});

/**
 * Schema for the request body of POST /chat/<chat_id>/message
 */
export const ChatMessageRequestSchema = v.object({
	content: v.string(),
});

/**
 * Schema for the response of POST /chat/<chat_id>/message
 */
export const ChatMessageResponseSchema = v.object({
	chat_id: v.number(),
	content: v.string(),
	id: v.number(),
	role: v.literal("assistant"),
	timestamp: v.string(),
});

/**
 * Schema for the response of GET /chat/<chat_id>
 */
export const ChatHistoryResponseSchema = v.object({
	chat_id: v.number(),
	messages: v.array(ChatMessageSchema),
	title: v.string(),
});
