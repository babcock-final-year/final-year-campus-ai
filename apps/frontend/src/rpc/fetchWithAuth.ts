import { useAuth } from "~/context/AuthContextProvider";
import AuthRpc from "./auth";
import { getClientEnv } from "~/utils/env";

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

	// run the request to check if the token is expired
	if (finalInit.method === "GET") {
		const res = await fetch(input, { ...finalInit, method: "HEAD" });

		// If the HEAD indicates an unauthorized access, try refreshing using the refresh token.
		if (res.status === 401 || res.status === 500) {
			const refreshRes = await AuthRpc.refresh.post();

			if (!refreshRes.success) throw Error("Could not refresh session");

			auth.setAccessToken(refreshRes.res.access_token);
		} else if (!res.ok && res.status >= 500) {
			// For server errors, bail out so the original request can handle it.
			throw Error("Server error");
		}
	}

	return fetch(input, finalInit);
}
