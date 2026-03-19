import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type { MessageResponseOutput } from "~/models/auth.schemas";
import AuthRpc from "~/rpc/auth";

/**
 * Reactive hook for AuthRpc.logout.post.
 * Triggers logout and returns the result reactively.
 *
 * @returns AccessorWithLatest<MessageResponseOutput | null | undefined>
 */
export default function createLogoutAuth(): AccessorWithLatest<
	MessageResponseOutput | null | undefined
> {
	const result = createAsync(async () => {
		const res = await AuthRpc.logout.post();

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
