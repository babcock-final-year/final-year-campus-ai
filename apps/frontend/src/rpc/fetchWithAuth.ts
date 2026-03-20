import { useAuth } from "~/context/AuthContextProvider";

/**
 * Performs a fetch, attaching Authorization header from `useAuth()` if available.
 * Defaults `credentials` to `"include"` unless explicitly provided in `init`.
 */
export default async function fetchWithAuth(
	input: RequestInfo,
	init?: RequestInit,
): Promise<Response> {
	const auth = useAuth();
	const token = auth.accessToken();

	// Build headers from whatever was passed in so we can set/merge safely.
	const headers = new Headers(init?.headers);

	// Only attach Authorization if:
	// - there is no existing Authorization header
	// - we have a token available
	if (!headers.has("Authorization") && token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	// Compose final init. We keep other fields from init as-is.
	const finalInit: RequestInit = {
		...init,
		headers,
	};

	return fetch(input, finalInit);
}
