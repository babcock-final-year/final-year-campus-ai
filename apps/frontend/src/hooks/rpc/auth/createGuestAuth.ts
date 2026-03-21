import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type { AuthResponseOutput } from "~/models/auth.schemas";
import AuthRpc from "~/rpc/auth";

/**
 * Reactive hook for AuthRpc.guest.post.
 * Triggers guest login and returns the result reactively.
 *
 * @returns AccessorWithLatest<AuthResponseOutput | null | undefined>
 */
export default function createGuestAuth(): AccessorWithLatest<
	AuthResponseOutput | null | undefined
> {
	const result = createAsync(async () => {
		const res = await AuthRpc.guest.post();

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
