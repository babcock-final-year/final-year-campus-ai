import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type {
	MessageResponseOutput,
	PasswordResetRequestInput,
} from "~/models/auth.schemas";
import AuthRpc from "~/rpc/auth";

/**
 * Reactive hook for AuthRpc.resetPassword.post.
 * Triggers a password reset email request and returns the result reactively.
 *
 * @param request - The email to send the reset link to.
 * @returns AccessorWithLatest<MessageResponseOutput | null | undefined>
 */
export default function createResetPasswordAuth(
	request: PasswordResetRequestInput,
): AccessorWithLatest<MessageResponseOutput | null | undefined> {
	const result = createAsync(async () => {
		const res = await AuthRpc.resetPassword.post(request);

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
