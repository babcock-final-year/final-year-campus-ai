import { query } from "@solidjs/router";
import * as v from "valibot";
import { SERVER_ENV } from "~/constants/env";
import {
	type ChatCreateRequestSchema,
	ChatCreateResponseSchema,
	ChatHistoryResponseSchema,
	type ChatMessageRequestSchema,
	ChatMessageResponseSchema,
} from "~/models/chat.schemas";
import { coerceToError } from "~/utils/error";
import type { ServerResultResponse } from "./_shared";

/**
 * ChatRpc provides type-safe, ergonomic methods for all chat-related backend routes.
 * Each method is wrapped in SolidStart query for caching/deduplication.
 */
const ChatRpc = {
	/**
	 * Get the chat history for a specific chat.
	 * @param chatId - The chat's unique identifier.
	 * @returns The chat's title and all messages.
	 */
	get: query(
		async (
			chatId: number | string,
		): Promise<
			ServerResultResponse<v.InferOutput<typeof ChatHistoryResponseSchema>>
		> => {
			try {
				const res = await fetch(
					`${SERVER_ENV.BACKEND_BASE_URL}/chat/${encodeURIComponent(String(chatId))}`,
					{
						credentials: "include",
						method: "GET",
					},
				);
				return {
					res: v.parse(ChatHistoryResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
		"ChatRpc.get",
	),

	/**
	 * Post a message to a chat and receive the assistant's response.
	 * @param chatId - The chat's unique identifier.
	 * @param messageRequest - The message content.
	 * @returns The assistant's message response.
	 */
	message: {
		post: query(
			async (
				chatId: number | string,
				messageRequest: v.InferInput<typeof ChatMessageRequestSchema>,
			): Promise<
				ServerResultResponse<v.InferOutput<typeof ChatMessageResponseSchema>>
			> => {
				try {
					const res = await fetch(
						`${SERVER_ENV.BACKEND_BASE_URL}/chat/${encodeURIComponent(String(chatId))}/message`,
						{
							body: JSON.stringify(messageRequest),
							credentials: "include",
							headers: { "Content-Type": "application/json" },
							method: "POST",
						},
					);
					return {
						res: v.parse(ChatMessageResponseSchema, await res.json()),
						success: true,
					};
				} catch (e) {
					return { err: coerceToError(e), success: false };
				}
			},
			"ChatRpc.message.post",
		),
	},

	/**
	 * Create a new chat for the current user.
	 * @param createRequest - Optional chat creation details (e.g., title).
	 * @returns The new chat's id and title.
	 */
	post: query(
		async (
			createRequest: v.InferInput<typeof ChatCreateRequestSchema>,
		): Promise<
			ServerResultResponse<v.InferOutput<typeof ChatCreateResponseSchema>>
		> => {
			try {
				const res = await fetch(`${SERVER_ENV.BACKEND_BASE_URL}/chat`, {
					body: JSON.stringify(createRequest),
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					method: "POST",
				});
				return {
					res: v.parse(ChatCreateResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
		"ChatRpc.post",
	),
} as const;

export default ChatRpc;
