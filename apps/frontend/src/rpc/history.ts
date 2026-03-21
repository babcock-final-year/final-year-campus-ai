import { query } from "@solidjs/router";
import * as v from "valibot";
import { useToastContext } from "~/context/ToastContextProvider";
import {
	type ChatMessageResponseOutput,
	ChatMessageResponseSchema,
} from "~/models/chat.schemas";
import {
	type ChatsListResponseOutput,
	ChatsListResponseSchema,
} from "~/models/history.schemas";
import { getClientEnv } from "~/utils/env";
import { coerceToError } from "~/utils/error";
import type { ServerResultResponse } from "./_shared";
import fetchWithAuth from "./fetchWithAuth";

/**
 * HistoryRpc provides type-safe, ergonomic methods for all history-related backend routes.
 * Each method is wrapped in SolidStart query for caching/deduplication.
 */
const BASE_PATH =
	`${getClientEnv().VITE_BACKEND_BASE_URL}/api/v1/history` as const;

/**
 * showRpcError - helper to surface an error to the user's toast region.
 *
 * This attempts to read the toast context and show a friendly message.
 * If the toast context is not available (e.g. called outside of a component
 * tree that provides it) we swallow the error after logging to console so
 * RPC callers still receive the original error object.
 */
function showRpcError(
	e: unknown,
	title: string,
	fallback = "An unexpected error occurred",
) {
	try {
		const toast = useToastContext();
		const err = coerceToError(e);
		toast.showToast({
			class: { alert: "alert-error", closeBtn: "btn-error" },
			description: err.message ?? fallback,
			title,
		});
	} catch (err) {
		// If toast context isn't available, don't throw - just log.
		// The RPC will still return the error to the caller.
		// This preserves backward compatibility for non-UI usages.
		// eslint-disable-next-line no-console
		console.error("Failed to show toast for RPC error:", err);
	}
}

const HistoryRpc = {
	/**
	 * List all chats for the current user.
	 * @returns An array of chat summaries for the authenticated user.
	 */
	chats: {
		/**
		 * Delete all chats for the current user.
		 * DELETE /history/chats
		 */
		delete: query(
			async (): Promise<ServerResultResponse<{ message: string }>> => {
				try {
					const res = await fetchWithAuth(`${BASE_PATH}/chats`, {
						method: "DELETE",
					});
					// backend returns a simple { message: string } response
					return {
						res: await res.json(),
						success: true,
					};
				} catch (e) {
					showRpcError(
						e,
						"Failed to delete chats",
						"Could not delete chat history",
					);
					return { err: coerceToError(e), success: false };
				}
			},
			"HistoryRpc.chats.delete",
		),
		get: query(
			async (): Promise<ServerResultResponse<ChatsListResponseOutput>> => {
				try {
					const res = await fetchWithAuth(`${BASE_PATH}/chats`, {
						method: "GET",
					});
					return {
						res: v.parse(ChatsListResponseSchema, await res.json()),
						success: true,
					};
				} catch (e) {
					showRpcError(
						e,
						"Failed to fetch chats",
						"Could not load chat history",
					);
					return { err: coerceToError(e), success: false };
				}
			},
			"HistoryRpc.chats.get",
		),
	},

	/**
	 * Like or unlike a specific message in a chat.
	 * POST /history/chat/:chat_id/message/:msg_id/like
	 * Body: { like: boolean }
	 */
	message: {
		like: {
			post: query(
				async (
					chatId: number | string,
					msgId: number | string,
					likeRequest: { like: boolean },
				): Promise<ServerResultResponse<ChatMessageResponseOutput>> => {
					try {
						const body = JSON.stringify(
							v.parse(v.object({ like: v.boolean() }), likeRequest),
						);
						const res = await fetchWithAuth(
							`${BASE_PATH}/chat/${encodeURIComponent(String(chatId))}/message/${encodeURIComponent(
								String(msgId),
							)}/like`,
							{
								body,
								headers: { "Content-Type": "application/json" },
								method: "POST",
							},
						);

						return {
							res: v.parse(ChatMessageResponseSchema, await res.json()),
							success: true,
						};
					} catch (e) {
						showRpcError(
							e,
							"Failed to like message",
							"Could not update message like",
						);
						return { err: coerceToError(e), success: false };
					}
				},
				"HistoryRpc.message.like.post",
			),
		},
	},
} as const;

export default HistoryRpc;
