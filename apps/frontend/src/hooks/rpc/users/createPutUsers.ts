import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type {
	UserUpdateRequestInput,
	UserUpdateResponseOutput,
} from "~/models/users.schemas";
import UsersRpc from "~/rpc/users";

/**
 * Reactive hook for UsersRpc.put.
 * Updates user profile fields and returns the updated user object reactively.
 *
 * @param userId - The user's unique identifier.
 * @param updateRequest - The fields to update (all optional).
 * @returns AccessorWithLatest<UserUpdateResponseOutput | null | undefined>
 */
export default function createPutUsers(
	userId: string,
	updateRequest: UserUpdateRequestInput,
): AccessorWithLatest<UserUpdateResponseOutput | null | undefined> {
	const result = createAsync(async () => {
		const res = await UsersRpc.put(userId, updateRequest);

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
