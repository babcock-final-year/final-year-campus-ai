"use server";
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
 * Each method abstracts fetch, validates with valibot, and returns a ServerResultResponse.
 */
const ChatRpc = {
	/**
	 * Get the chat history for a specific chat.
	 * @param chatId - The chat's unique identifier.
	 * @returns The chat's title and all messages.
	 */
	async get(
		chatId: number | string,
	): Promise<
		ServerResultResponse<v.InferOutput<typeof ChatHistoryResponseSchema>>
	> {
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

	/**
	 * Post a message to a chat and receive the assistant's response.
	 * @param chatId - The chat's unique identifier.
	 * @param messageRequest - The message content.
	 * @returns The assistant's message response.
	 */
	message: {
		async post(
			chatId: number | string,
			messageRequest: v.InferInput<typeof ChatMessageRequestSchema>,
		): Promise<
			ServerResultResponse<v.InferOutput<typeof ChatMessageResponseSchema>>
		> {
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
	},
	/**
	 * Create a new chat for the current user.
	 * @param createRequest - Optional chat creation details (e.g., title).
	 * @returns The new chat's id and title.
	 */
	async post(
		createRequest: v.InferInput<typeof ChatCreateRequestSchema>,
	): Promise<
		ServerResultResponse<v.InferOutput<typeof ChatCreateResponseSchema>>
	> {
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
} as const;

export default ChatRpc;
