import { query } from "@solidjs/router";
import * as v from "valibot";
import { ChatsListResponseSchema } from "~/models/history.schemas";
import { getClientEnv } from "~/utils/env";
import { coerceToError } from "~/utils/error";
import type { ServerResultResponse } from "./_shared";

/**
 * HistoryRpc provides type-safe, ergonomic methods for all history-related backend routes.
 * Each method is wrapped in SolidStart query for caching/deduplication.
 */
const HistoryRpc = {
	/**
	 * List all chats for the current user.
	 * @returns An array of chat summaries for the authenticated user.
	 */
	chats: {
		get: query(
			async (): Promise<
				ServerResultResponse<v.InferOutput<typeof ChatsListResponseSchema>>
			> => {
				try {
					const res = await fetch(
						`${getClientEnv().VITE_BACKEND_BASE_URL}/history/chats`,
						{
							credentials: "include",
							method: "GET",
						},
					);
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
} as const;

export default HistoryRpc;
