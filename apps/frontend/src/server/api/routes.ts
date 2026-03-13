const API_PREFIX = "/api/v1" as const;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RouteDef = Readonly<{
	method: HttpMethod;
	pathTemplate: string;
	build: (params?: Record<string, string | number | undefined>) => string;
}>;

function encodePathSegment(value: string | number): string {
	return encodeURIComponent(String(value));
}

function buildPath(
	pathTemplate: string,
	params: Record<string, string | number | undefined> = {},
): string {
	const path = pathTemplate.replaceAll(
		/:([A-Za-z0-9_]+)/g,
		(_m, key: string) => {
			const value = params[key];

			if (value === undefined) {
				throw new Error(
					`Missing route param "${key}" for template "${pathTemplate}"`,
				);
			}

			return encodePathSegment(value);
		},
	);

	return path;
}

function route(method: HttpMethod, pathTemplate: string): RouteDef {
	return {
		build: (params) => buildPath(pathTemplate, params ?? {}),
		method,
		pathTemplate,
	} as const;
}

export const backendRoutes = {
	auth: {
		changeEmail: route("POST", `${API_PREFIX}/auth/change-email`),
		changeEmailConfirm: route(
			"GET",
			`${API_PREFIX}/auth/change-email-confirm/:token`,
		),
		confirm: route("GET", `${API_PREFIX}/auth/confirm/:token`),
		google: route("POST", `${API_PREFIX}/auth/google`),
		guest: route("POST", `${API_PREFIX}/auth/guest`),
		login: route("POST", `${API_PREFIX}/auth/login`),
		logout: route("POST", `${API_PREFIX}/auth/logout`),
		me: route("GET", `${API_PREFIX}/auth/me`),
		refresh: route("POST", `${API_PREFIX}/auth/refresh`),
		register: route("POST", `${API_PREFIX}/auth/register`),
		resetPassword: route("POST", `${API_PREFIX}/auth/reset-password`),
		resetPasswordConfirm: route(
			"POST",
			`${API_PREFIX}/auth/reset-password-confirm/:token`,
		),
	},
	chat: {
		create: route("POST", `${API_PREFIX}/chat`),
		get: route("GET", `${API_PREFIX}/chat/:chat_id`),
		postMessage: route("POST", `${API_PREFIX}/chat/:chat_id/message`),
	},
	complaints: {
		create: route("POST", `${API_PREFIX}/complaints`),
		get: route("GET", `${API_PREFIX}/complaints/:complaint_id`),
		list: route("GET", `${API_PREFIX}/complaints`),
	},
	history: {
		clearChats: route("DELETE", `${API_PREFIX}/history/chats`),
		deleteChat: route("DELETE", `${API_PREFIX}/history/chat/:chat_id`),
		deleteMessage: route(
			"DELETE",
			`${API_PREFIX}/history/chat/:chat_id/message/:msg_id`,
		),
		getMessages: route("GET", `${API_PREFIX}/history/chat/:chat_id/messages`),
		likeMessage: route(
			"POST",
			`${API_PREFIX}/history/chat/:chat_id/message/:msg_id/like`,
		),
		listChats: route("GET", `${API_PREFIX}/history/chats`),
		search: route("GET", `${API_PREFIX}/history/search`),
	},
	users: {
		get: route("GET", `${API_PREFIX}/users/:user_id`),
		update: route("PUT", `${API_PREFIX}/users/:user_id`),
		uploadAvatar: route("POST", `${API_PREFIX}/users/:user_id/avatar`),
	},
} as const;
