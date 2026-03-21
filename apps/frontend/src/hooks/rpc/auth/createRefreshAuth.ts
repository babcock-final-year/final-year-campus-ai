import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type { AccessTokenResponseOutput } from "~/models/auth.schemas";
import AuthRpc from "~/rpc/auth";

/**
 * Reactive hook for AuthRpc.refresh.post.
 * Triggers a refresh of the access token and returns the result reactively.
 *
 * @returns AccessorWithLatest<AccessTokenResponseOutput | null | undefined>
 */
export default function createRefreshAuth(): AccessorWithLatest<
	AccessTokenResponseOutput | null | undefined
> {
	const result = createAsync(async () => {
		const res = await AuthRpc.refresh.post();

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
