import * as v from "valibot";
import { UserBaseSchema } from "./users.schemas";

/**
 * Schema for the request body of POST /chat
 */
export const ChatCreateRequestSchema = v.object({
	title: v.nullish(v.string()),
});
export type ChatCreateRequestInput = v.InferInput<
	typeof ChatCreateRequestSchema
>;
export type ChatCreateRequestOutput = v.InferOutput<
	typeof ChatCreateRequestSchema
>;

/**
 * Schema for the response of POST /chat
 */
export const ChatCreateResponseSchema = v.object({
	chat_id: v.number(),
	title: v.string(),
});
export type ChatCreateResponseInput = v.InferInput<
	typeof ChatCreateResponseSchema
>;
export type ChatCreateResponseOutput = v.InferOutput<
	typeof ChatCreateResponseSchema
>;

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
export type ChatMessageInput = v.InferInput<typeof ChatMessageSchema>;
export type ChatMessageOutput = v.InferOutput<typeof ChatMessageSchema>;

/**
 * Schema for the request body of POST /chat/<chat_id>/message
 */
export const ChatMessageRequestSchema = v.object({
	content: v.string(),
});
export type ChatMessageRequestInput = v.InferInput<
	typeof ChatMessageRequestSchema
>;
export type ChatMessageRequestOutput = v.InferOutput<
	typeof ChatMessageRequestSchema
>;

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
export type ChatMessageResponseInput = v.InferInput<
	typeof ChatMessageResponseSchema
>;
export type ChatMessageResponseOutput = v.InferOutput<
	typeof ChatMessageResponseSchema
>;

/**
 * Schema for the response of GET /chat/<chat_id>
 */
export const ChatHistoryResponseSchema = v.object({
	chat_id: v.number(),
	messages: v.array(ChatMessageSchema),
	title: v.string(),
});
export type ChatHistoryResponseInput = v.InferInput<
	typeof ChatHistoryResponseSchema
>;
export type ChatHistoryResponseOutput = v.InferOutput<
	typeof ChatHistoryResponseSchema
>;
