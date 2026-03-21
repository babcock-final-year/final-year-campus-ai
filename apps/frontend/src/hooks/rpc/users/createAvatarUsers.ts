import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type { AvatarUploadResponseOutput } from "~/models/users.schemas";
import UsersRpc from "~/rpc/users";

/**
 * Reactive hook for UsersRpc.avatar.post.
 * Uploads a new avatar for the user and returns the result reactively.
 *
 * @param userId - The user's unique identifier.
 * @param file - The avatar file (File or Blob).
 * @returns AccessorWithLatest<AvatarUploadResponseOutput | null | undefined>
 */
export default function createAvatarUsers(
	userId: string,
	file: File | Blob,
): AccessorWithLatest<AvatarUploadResponseOutput | null | undefined> {
	const result = createAsync(async () => {
		const res = await UsersRpc.avatar.post(userId, file);

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
