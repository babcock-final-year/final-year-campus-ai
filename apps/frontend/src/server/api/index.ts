"use server";

import { getBackendBaseUrl } from "~/constants/env";
import { ApiClient } from "./client";
import { backendRoutes } from "./routes";

const tokenStore = {
	accessToken: null as string | null,
	refreshToken: null as string | null,
};

export function setAuthTokens(tokens: {
	accessToken: string;
	refreshToken: string;
}): void {
	tokenStore.accessToken = tokens.accessToken;
	tokenStore.refreshToken = tokens.refreshToken;
}

export function clearAuthTokens(): void {
	tokenStore.accessToken = null;
	tokenStore.refreshToken = null;
}

export function getAccessToken(): string | null {
	return tokenStore.accessToken;
}

export function getRefreshToken(): string | null {
	return tokenStore.refreshToken;
}

export const backendApi = new ApiClient({
	baseUrl: getBackendBaseUrl(),
	getAccessToken,
	getRefreshToken,
	setTokens: (tokens) => {
		setAuthTokens({
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
		});
	},
});

export { backendRoutes };
export type { ApiError, ApiResult } from "./client";
