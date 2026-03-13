"use server";

import type {
	ChatHistoryResponse,
	ChatMessageRequest,
	ChatMessageResponse,
	ChatsListResponse,
	DeleteResponse,
	LikeMessageRequest,
	SearchResponse,
} from "@packages/shared-types";
import { backendApi, backendRoutes } from "~/server/api";
import { getChatMessagesQuery, listChatsQuery } from "./queries";

export async function listChats(): Promise<ChatsListResponse> {
	return await listChatsQuery();
}

export async function clearAllChats(): Promise<DeleteResponse> {
	const res = await backendApi.delete<DeleteResponse>(
		backendRoutes.history.clearChats.build(),
	);

	if (!res.ok) return { message: "Failed to clear chats" };

	return res.data;
}

export async function getChatMessages(
	chat_id: string,
): Promise<ChatHistoryResponse | null> {
	return await getChatMessagesQuery(chat_id);
}

export async function deleteChat(chat_id: string): Promise<DeleteResponse> {
	const res = await backendApi.delete<DeleteResponse>(
		backendRoutes.history.deleteChat.build({ chat_id }),
	);

	if (!res.ok) return { message: "Failed to delete chat" };

	return res.data;
}

export async function deleteMessage(
	chat_id: string,
	msg_id: number,
): Promise<DeleteResponse> {
	const res = await backendApi.delete<DeleteResponse>(
		backendRoutes.history.deleteMessage.build({ chat_id, msg_id }),
	);

	if (!res.ok) return { message: "Failed to delete message" };

	return res.data;
}

export async function likeMessage(
	chat_id: string,
	msg_id: number,
	like: boolean,
): Promise<ChatMessageResponse | null> {
	const res = await backendApi.post<ChatMessageResponse, LikeMessageRequest>(
		backendRoutes.history.likeMessage.build({ chat_id, msg_id }),
		{ like },
	);

	if (!res.ok) return null;

	return res.data;
}

export async function searchMessages(q: string): Promise<SearchResponse> {
	const res = await backendApi.get<SearchResponse>(
		backendRoutes.history.search.build(),
		{
			q,
		},
	);

	if (!res.ok) return { results: [] };

	return res.data;
}

export async function createChat(
	title?: string,
): Promise<{ chat_id: string; title: string } | null> {
	const res = await backendApi.post<
		{ chat_id: string; title: string },
		{ title?: string }
	>(backendRoutes.chat.create.build(), title ? { title } : undefined);

	if (!res.ok) return null;

	return res.data;
}

export async function postChatMessage(
	chat_id: string,
	body: ChatMessageRequest,
): Promise<ChatMessageResponse | null> {
	const res = await backendApi.post<ChatMessageResponse, ChatMessageRequest>(
		backendRoutes.chat.postMessage.build({ chat_id }),
		body,
	);

	if (!res.ok) return null;

	return res.data;
}

// Intentionally removed: use the cached query wrapper `getUserChatHistoryQuery` from `~/server/queries` instead.
// Keeping this file focused on raw endpoint calls avoids duplicate fetching paths.
