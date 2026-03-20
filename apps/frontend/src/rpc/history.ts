import { query } from "@solidjs/router";
import * as v from "valibot";
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

const HistoryRpc = {
	/**
	 * List all chats for the current user.
	 * @returns An array of chat summaries for the authenticated user.
	 */
	chats: {
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
						return { err: coerceToError(e), success: false };
					}
				},
				"HistoryRpc.message.like.post",
			),
		},
	},
} as const;

export default HistoryRpc;
