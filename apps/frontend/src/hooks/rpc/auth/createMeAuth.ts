import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import AuthRpc from "~/rpc/auth";

/**
 * Reactive hook for fetching the current logged-in user's info via AuthRpc.me.get.
 * Returns an accessor that resolves to the user object or null if not authenticated.
 */
export default function createMeAuth(): AccessorWithLatest<
	{ user: unknown } | null | undefined
> {
	const me = createAsync(async () => {
		const res = await AuthRpc.me.get();

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return me;
}
