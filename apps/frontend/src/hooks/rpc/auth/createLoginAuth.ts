import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type {
	AuthResponseOutput,
	UserLoginRequestInput,
} from "~/models/auth.schemas";
import AuthRpc from "~/rpc/auth";

/**
 * Reactive hook for AuthRpc.login.post.
 * Triggers login and returns the result reactively.
 *
 * @param loginRequest - The login credentials.
 * @returns AccessorWithLatest<AuthResponseOutput | null | undefined>
 */
export default function createLoginAuth(
	loginRequest: UserLoginRequestInput,
): AccessorWithLatest<AuthResponseOutput | null | undefined> {
	const result = createAsync(async () => {
		const res = await AuthRpc.login.post(loginRequest);

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
