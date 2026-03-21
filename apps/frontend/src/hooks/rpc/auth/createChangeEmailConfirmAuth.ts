import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type { MessageResponseOutput } from "~/models/auth.schemas";
import AuthRpc from "~/rpc/auth";

/**
 * Reactive hook for AuthRpc.changeEmailConfirm.get.
 * Triggers email change confirmation and returns the result reactively.
 *
 * @param token - The confirmation token sent to the new email.
 * @returns AccessorWithLatest<MessageResponseOutput | null | undefined>
 */
export default function createChangeEmailConfirmAuth(
	token: string,
): AccessorWithLatest<MessageResponseOutput | null | undefined> {
	const result = createAsync(async () => {
		if (!token) return null;

		const res = await AuthRpc.changeEmailConfirm.get(token);

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
