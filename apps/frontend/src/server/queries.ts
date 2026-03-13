"use server";

import type {
	ChatHistoryResponse,
	ChatsListResponse,
	UserBase,
} from "@packages/shared-types";
import { query, revalidate } from "@solidjs/router";
import { backendApi, backendRoutes } from "~/server/api";

export const getUserProfileQuery = query(async (): Promise<UserBase | null> => {
	"use server";

	const res = await backendApi.get<{ user: UserBase }>(
		backendRoutes.auth.me.build(),
	);
	if (!res.ok) return null;

	return res.data.user;
}, "backend.user.me");

export function revalidateUserProfile(): Promise<void> {
	return revalidate(getUserProfileQuery.key);
}

export const listChatsQuery = query(async (): Promise<ChatsListResponse> => {
	"use server";

	const res = await backendApi.get<ChatsListResponse>(
		backendRoutes.history.listChats.build(),
	);
	if (!res.ok) return { chats: [] };

	return res.data;
}, "backend.history.chats.list");

export function revalidateChatsList(): Promise<void> {
	return revalidate(listChatsQuery.key);
}

export const getChatMessagesQuery = query(
	async (chat_id: string): Promise<ChatHistoryResponse | null> => {
		"use server";

		const id = chat_id?.trim();
		if (!id) return null;

		const res = await backendApi.get<ChatHistoryResponse>(
			backendRoutes.history.getMessages.build({ chat_id: id }),
		);
		if (!res.ok) return null;

		return res.data;
	},
	"backend.history.chat.messages",
);

export function revalidateChatMessages(chat_id: string): Promise<void> {
	return revalidate(getChatMessagesQuery.keyFor(chat_id));
}

export const getUserChatHistoryQuery = query(
	async (): Promise<ChatHistoryResponse | null> => {
		"use server";

		const chats = await listChatsQuery();
		const mostRecent = chats.chats.at(0);
		if (!mostRecent) return null;

		return await getChatMessagesQuery(mostRecent.id);
	},
	"backend.history.chat.mostRecent",
);

export function revalidateUserChatHistory(): Promise<void> {
	return revalidate(getUserChatHistoryQuery.key);
}
