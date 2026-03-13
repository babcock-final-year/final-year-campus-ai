import {
	createAsync,
	query,
	type RouteDefinition,
	useParams,
} from "@solidjs/router";
import { createMemo } from "solid-js";
import ChatMainArea from "~/components/chat/ChatMainArea";
import { getChatMessagesQuery } from "~/server/queries";

export const route = {
	preload: ({ params }) => {
		const chatId = params["chatId"]?.trim();
		if (!chatId) return;

		return getChatMessagesQuery(chatId);
	},
} satisfies RouteDefinition;

export default function ChatDetailsPage() {
	const params = useParams<{ chatId: string }>();

	const chatId = createMemo(() => {
		const raw = params.chatId;
		if (typeof raw !== "string") return null;

		const trimmed = raw.trim();
		if (!trimmed) return null;

		return trimmed;
	});

	return <ChatMainArea chatId={chatId()} />;
}
