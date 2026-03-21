import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type {
	MessageResponseOutput,
	PasswordResetConfirmRequestInput,
} from "~/models/auth.schemas";
import AuthRpc from "~/rpc/auth";

/**
 * Reactive hook for AuthRpc.resetPasswordConfirm.post.
 * Triggers password reset confirmation and returns the result reactively.
 *
 * @param token - The reset token from the email.
 * @param request - The new password and confirmation.
 * @returns AccessorWithLatest<MessageResponseOutput | null | undefined>
 */
export default function createResetPasswordConfirmAuth(
	token: string,
	request: PasswordResetConfirmRequestInput,
): AccessorWithLatest<MessageResponseOutput | null | undefined> {
	const result = createAsync(async () => {
		const res = await AuthRpc.resetPasswordConfirm.post(token, request);

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
