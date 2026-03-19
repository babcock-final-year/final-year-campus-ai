import { query } from "@solidjs/router";
import * as v from "valibot";
import {
	type ChatCreateRequestInput,
	ChatCreateRequestSchema,
	type ChatCreateResponseOutput,
	ChatCreateResponseSchema,
	type ChatHistoryResponseOutput,
	ChatHistoryResponseSchema,
	type ChatMessageRequestInput,
	ChatMessageRequestSchema,
	type ChatMessageResponseOutput,
	ChatMessageResponseSchema,
} from "~/models/chat.schemas";
import { getClientEnv } from "~/utils/env";
import { coerceToError } from "~/utils/error";
import type { ServerResultResponse } from "./_shared";

/**
 * ChatRpc provides type-safe, ergonomic methods for all chat-related backend routes.
 * Each method is wrapped in SolidStart query for caching/deduplication.
 */
const BASE_PATH =
	`${getClientEnv().VITE_BACKEND_BASE_URL}/api/v1/chat` as const;

const ChatRpc = {
	/**
	 * Get the chat history for a specific chat.
	 * @param chatId - The chat's unique identifier.
	 * @returns The chat's title and all messages.
	 */
	get: query(
		async (
			chatId: number | string,
		): Promise<ServerResultResponse<ChatHistoryResponseOutput>> => {
			try {
				const res = await fetch(
					`${BASE_PATH}/${encodeURIComponent(String(chatId))}`,
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
				messageRequest: ChatMessageRequestInput,
			): Promise<ServerResultResponse<ChatMessageResponseOutput>> => {
				try {
					const res = await fetch(
						`${BASE_PATH}/${encodeURIComponent(String(chatId))}/message`,
						{
							body: JSON.stringify(
								v.parse(ChatMessageRequestSchema, messageRequest),
							),
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
			createRequest: ChatCreateRequestInput,
		): Promise<ServerResultResponse<ChatCreateResponseOutput>> => {
			try {
				const res = await fetch(`${BASE_PATH}`, {
					body: JSON.stringify(v.parse(ChatCreateRequestSchema, createRequest)),
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
