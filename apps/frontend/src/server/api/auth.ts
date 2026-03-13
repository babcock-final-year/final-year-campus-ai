"use server";

type TokenPair = {
	access_token: string;
	refresh_token: string;
};

export type AuthTokens = {
	accessToken: string;
	refreshToken: string;
};

let tokenPair: TokenPair | null = null;

export function setAuthTokens(tokens: AuthTokens): void {
	tokenPair = {
		access_token: tokens.accessToken,
		refresh_token: tokens.refreshToken,
	};
}

export function setTokenPair(tokens: TokenPair): void {
	tokenPair = tokens;
}

export function clearAuthTokens(): void {
	tokenPair = null;
}

export function getAccessToken(): string | null {
	return tokenPair?.access_token ?? null;
}

export function getRefreshToken(): string | null {
	return tokenPair?.refresh_token ?? null;
}

export function getAuthHeader(): { Authorization: string } | {} {
	const token = getAccessToken();
	if (!token) return {};

	return { Authorization: `Bearer ${token}` };
}
