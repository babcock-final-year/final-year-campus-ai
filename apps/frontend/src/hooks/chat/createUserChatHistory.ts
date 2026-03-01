import { createAsync } from "@solidjs/router";
import { getUserChatHistory } from "~/server/chat";

export default function createUserChatHistory() {
	const userChatHistory = createAsync(async () => getUserChatHistory());

	return userChatHistory;
}
