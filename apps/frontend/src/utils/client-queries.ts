import type {
	ChatHistoryResponse,
	ChatsListResponse,
	UserBase,
} from "@packages/shared-types";
import { createSignal } from "solid-js";
import { backendClient } from "./backend-client";

export const DEFAULT_USER_PROFILE = {
	avatar_url: null,
	email: "???",
	full_name: "Guest",
	id: "0",
	is_guest: true,
	matric_no: null,
} as const satisfies UserBase;

type Resource<T> = {
	readonly loading: () => boolean;
	readonly error: () => string | null;
	readonly data: () => T;
	readonly refetch: () => Promise<T>;
};

function createResource<T>(opts: {
	initialValue: T;
	fetcher: () => Promise<T>;
}): Resource<T> {
	const [loading, setLoading] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);
	const [data, setData] = createSignal<T>(opts.initialValue);

	const refetch = async (): Promise<T> => {
		if (loading()) return data();

		setLoading(true);
		setError(null);

		try {
			const next = await opts.fetcher();
			setData(next);
			return next;
		} catch (e) {
			setError(e instanceof Error ? e.message : "Request failed");
			return data();
		} finally {
			setLoading(false);
		}
	};

	return {
		data,
		error,
		loading,
		refetch,
	} as const;
}

export function createUserProfileQuery(): Resource<UserBase> {
	return createResource<UserBase>({
		fetcher: async () => {
			const res = await backendClient.get<{ user: UserBase }>(
				"/api/v1/auth/me",
			);
			if (!res.ok) return structuredClone(DEFAULT_USER_PROFILE);

			return res.data.user;
		},
		initialValue: DEFAULT_USER_PROFILE,
	});
}

export function createChatsListQuery(): Resource<ChatsListResponse> {
	return createResource<ChatsListResponse>({
		fetcher: async () => {
			const res = await backendClient.get<ChatsListResponse>(
				"/api/v1/history/chats",
			);
			if (!res.ok) return { chats: [] };

			return res.data;
		},
		initialValue: { chats: [] },
	});
}

export function createChatMessagesQuery(
	chatId: () => string | null | undefined,
): Resource<ChatHistoryResponse | null> {
	return createResource<ChatHistoryResponse | null>({
		fetcher: async () => {
			const id = chatId();
			if (typeof id !== "string" || id.trim().length === 0) return null;

			const res = await backendClient.get<ChatHistoryResponse>(
				`/api/v1/history/chats/${encodeURIComponent(id)}/messages`,
			);
			if (!res.ok) return null;

			return res.data;
		},
		initialValue: null,
	});
}
