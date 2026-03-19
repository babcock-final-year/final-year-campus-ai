import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type { ChatHistoryResponseOutput } from "~/models/chat.schemas";
import type { ServerResultResponse } from "~/rpc/_shared";
import ChatRpc from "~/rpc/chat";

/**
 * Reactive hook for fetching chat history by chatId using ChatRpc.get.
 * @param chatId - The chat's unique identifier.
 * @returns AccessorWithLatest for the chat history response or null/undefined.
 */
export default function createGetChat(
	chatId: number | string,
): AccessorWithLatest<
	ServerResultResponse<ChatHistoryResponseOutput> | null | undefined
> {
	const chatHistory = createAsync(async () => {
		const res = await ChatRpc.get(chatId);

		return res;
	});

	return chatHistory;
}
