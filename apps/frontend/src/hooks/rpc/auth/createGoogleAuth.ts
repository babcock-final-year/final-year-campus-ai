import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type {
	AuthResponseOutput,
	GoogleAuthRequestInput,
} from "~/models/auth.schemas";
import AuthRpc from "~/rpc/auth";

/**
 * Reactive hook for AuthRpc.google.post.
 * Triggers Google OAuth login/register and returns the result reactively.
 *
 * @param googleRequest - The Google authentication request payload.
 * @returns AccessorWithLatest<AuthResponseOutput | null | undefined>
 */
export default function createGoogleAuth(
	googleRequest: GoogleAuthRequestInput,
): AccessorWithLatest<AuthResponseOutput | null | undefined> {
	const result = createAsync(async () => {
		const res = await AuthRpc.google.post(googleRequest);

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
