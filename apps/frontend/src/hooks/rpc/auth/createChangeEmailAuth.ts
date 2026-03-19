import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type {
	EmailChangeRequestInput,
	MessageResponseOutput,
} from "~/models/auth.schemas";
import AuthRpc from "~/rpc/auth";

/**
 * Reactive hook for AuthRpc.changeEmail.post.
 * Triggers an email change request and returns the result reactively.
 *
 * @param changeRequest - The new email and current password.
 * @returns AccessorWithLatest<MessageResponseOutput | null | undefined>
 */
export default function createChangeEmailAuth(
	changeRequest: EmailChangeRequestInput,
): AccessorWithLatest<MessageResponseOutput | null | undefined> {
	const result = createAsync(async () => {
		const res = await AuthRpc.changeEmail.post(changeRequest);

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
