"use server";
import * as v from "valibot";
import { SERVER_ENV } from "~/constants/env";
import { ChatsListResponseSchema } from "~/models/history.schemas";
import { coerceToError } from "~/utils/error";
import type { ServerResultResponse } from "./_shared";

/**
 * HistoryRpc provides type-safe, ergonomic methods for all history-related backend routes.
 * Each method abstracts fetch, validates with valibot, and returns a ServerResultResponse.
 */
const HistoryRpc = {
	/**
	 * List all chats for the current user.
	 * @returns An array of chat summaries for the authenticated user.
	 */
	chats: {
		async get(): Promise<
			ServerResultResponse<v.InferOutput<typeof ChatsListResponseSchema>>
		> {
			try {
				const res = await fetch(
					`${SERVER_ENV.BACKEND_BASE_URL}/history/chats`,
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
	},
} as const;

export default HistoryRpc;
