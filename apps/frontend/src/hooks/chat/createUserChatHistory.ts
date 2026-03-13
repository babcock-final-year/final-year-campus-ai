import { createAsync } from "@solidjs/router";
import { getUserChatHistoryQuery } from "~/server/queries";

export default function createUserChatHistory() {
	const userChatHistory = createAsync(() => getUserChatHistoryQuery(), {
		initialValue: null,
	});

	return userChatHistory;
}
