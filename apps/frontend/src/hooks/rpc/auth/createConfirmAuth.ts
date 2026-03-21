import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type { MessageResponseOutput } from "~/models/auth.schemas";
import AuthRpc from "~/rpc/auth";

/**
 * Reactive hook for AuthRpc.confirm.get.
 * Triggers email confirmation using the provided token and returns the result reactively.
 *
 * @param token - The confirmation token from the email.
 * @returns AccessorWithLatest<MessageResponseOutput | null | undefined>
 */
export default function createConfirmAuth(
	token: string,
): AccessorWithLatest<MessageResponseOutput | null | undefined> {
	const result = createAsync(async () => {
		if (!token) return null;

		const res = await AuthRpc.confirm.get(token);

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
