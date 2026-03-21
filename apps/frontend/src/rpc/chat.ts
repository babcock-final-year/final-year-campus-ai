import { query } from "@solidjs/router";
import * as v from "valibot";
import { useToastContext } from "~/context/ToastContextProvider";
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
import fetchWithAuth from "./fetchWithAuth";

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
				const res = await fetchWithAuth(
					`${BASE_PATH}/${encodeURIComponent(String(chatId))}`,
					{ method: "GET" },
				);
				return {
					res: v.parse(ChatHistoryResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				// Show a toast for visibility in the UI.
				try {
					const toast = useToastContext();
					const err = coerceToError(e);
					toast.showToast({
						class: { alert: "alert-error", closeBtn: "btn-error" },
						description: err.message ?? "Unknown error",
						title: "Failed to load chat",
					});
				} catch {
					// If toast cannot be shown (e.g. called outside component), swallow silently.
				}

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
					const res = await fetchWithAuth(
						`${BASE_PATH}/${encodeURIComponent(String(chatId))}/message`,
						{
							body: JSON.stringify(
								v.parse(ChatMessageRequestSchema, messageRequest),
							),
							headers: { "Content-Type": "application/json" },
							method: "POST",
						},
					);
					return {
						res: v.parse(ChatMessageResponseSchema, await res.json()),
						success: true,
					};
				} catch (e) {
					// Show a toast for visibility in the UI.
					try {
						const toast = useToastContext();
						const err = coerceToError(e);
						toast.showToast({
							class: { alert: "alert-error", closeBtn: "btn-error" },
							description: err.message ?? "Unknown error",
							title: "Failed to send chat message",
						});
					} catch {
						// If toast cannot be shown, continue returning the error.
					}

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
				const res = await fetchWithAuth(`${BASE_PATH}`, {
					body: JSON.stringify(v.parse(ChatCreateRequestSchema, createRequest)),
					headers: { "Content-Type": "application/json" },
					method: "POST",
				});
				return {
					res: v.parse(ChatCreateResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				// Show a toast for visibility in the UI.
				try {
					const toast = useToastContext();
					const err = coerceToError(e);
					toast.showToast({
						class: { alert: "alert-error", closeBtn: "btn-error" },
						description:
							err.message ??
							"An unexpected error occurred while creating the chat.",
						title: "Failed to create chat",
					});
				} catch {
					// If toast cannot be shown, ignore and return the error as usual.
				}

				return { err: coerceToError(e), success: false };
			}
		},
		"ChatRpc.post",
	),
} as const;

export default ChatRpc;
