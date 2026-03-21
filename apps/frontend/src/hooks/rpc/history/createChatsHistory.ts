import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type { ChatsListResponseOutput } from "~/models/history.schemas";
import HistoryRpc from "~/rpc/history";

/**
 * Reactive hook for fetching all chat histories for the current user.
 * Wraps HistoryRpc.chats.get in a SolidJS createAsync for reactivity.
 *
 * @returns AccessorWithLatest<ChatsListResponseOutput | null | undefined>
 */
export default function createChatsHistory(): AccessorWithLatest<
	ChatsListResponseOutput | null | undefined
> {
	const chats = createAsync(async () => {
    const res = await HistoryRpc.chats.get();

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return chats;
}
