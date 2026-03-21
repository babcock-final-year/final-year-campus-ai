import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type {
	ChatMessageRequestInput,
	ChatMessageResponseOutput,
} from "~/models/chat.schemas";
import ChatRpc from "~/rpc/chat";

/**
 * Reactive hook for ChatRpc.message.post.
 * Sends a message to a chat and returns the assistant's response reactively.
 *
 * @param chatId - The chat's unique identifier.
 * @param messageRequest - The message content and metadata.
 * @returns AccessorWithLatest<ChatMessageResponseOutput | null | undefined>
 */
export default function createMessageChat(
	chatId: number | string,
	messageRequest: ChatMessageRequestInput,
): AccessorWithLatest<ChatMessageResponseOutput | null | undefined> {
	const result = createAsync(async () => {
		const res = await ChatRpc.message.post(chatId, messageRequest);

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
