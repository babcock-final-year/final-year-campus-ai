import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type {
	UserBaseOutput,
	UserProfileResponseOutput,
} from "~/models/users.schemas";
import AuthRpc from "~/rpc/auth";
import UsersRpc from "~/rpc/users";

export default function createUserProfile(): AccessorWithLatest<
	UserBaseOutput | null | undefined
> {
	const profile = createAsync(async () => {
		const meAuth = await AuthRpc.me.get();

		if (!meAuth.success) return null;

		console.log("createUserProfile user =", meAuth.res.user);

		const res = await UsersRpc.get(meAuth.res.user?.id);

		if (res.success) {
			return res.res.user;
		}
		return null;
	});

	return profile;
}
