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
	const token = auth?.accessToken ?? null;

	// Build headers from whatever was passed in so we can set/merge safely.
	const headers = new Headers(init?.headers);

	// Only attach Authorization if:
	// - there is no existing Authorization header
	// - we have a token available
	if (!headers.has("Authorization") && token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	// Default credentials to include to preserve cookie-based refresh flows.
	const credentials = init?.credentials ?? "include";

	// Compose final init. We keep other fields from init as-is.
	const finalInit: RequestInit = {
		...init,
		credentials,
		headers,
	};

	return fetch(input, finalInit);
}
