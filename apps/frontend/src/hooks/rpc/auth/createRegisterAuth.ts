import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type {
	AuthResponseOutput,
	UserRegisterRequestInput,
} from "~/models/auth.schemas";
import AuthRpc from "~/rpc/auth";

/**
 * Reactive hook for AuthRpc.register.post.
 * Triggers registration and returns the result reactively.
 *
 * @param registerRequest - The registration details.
 * @returns AccessorWithLatest<AuthResponseOutput | null | undefined>
 */
export default function createRegisterAuth(
	registerRequest: UserRegisterRequestInput,
): AccessorWithLatest<AuthResponseOutput | null | undefined> {
	const result = createAsync(async () => {
		const res = await AuthRpc.register.post(registerRequest);

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
