const ACCESS_TOKEN_KEY = "campus_ai_access_token";
const REFRESH_TOKEN_KEY = "campus_ai_refresh_token";

export type AuthTokens = {
	accessToken: string;
	refreshToken: string;
};

function isBrowser(): boolean {
	return (
		typeof window !== "undefined" && typeof window.localStorage !== "undefined"
	);
}

export function getAccessToken(): string | null {
	if (!isBrowser()) return null;

	const v = window.localStorage.getItem(ACCESS_TOKEN_KEY);
	if (!v) return null;

	return v;
}

export function getRefreshToken(): string | null {
	if (!isBrowser()) return null;

	const v = window.localStorage.getItem(REFRESH_TOKEN_KEY);
	if (!v) return null;

	return v;
}

export function setAuthTokens(tokens: AuthTokens): void {
	if (!isBrowser()) return;

	window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
	window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearAuthTokens(): void {
	if (!isBrowser()) return;

	window.localStorage.removeItem(ACCESS_TOKEN_KEY);
	window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasAuthTokens(): boolean {
	return getAccessToken() !== null && getRefreshToken() !== null;
}
