import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type {
	UserBaseOutput,
	UserProfileResponseOutput,
} from "~/models/users.schemas";
import AuthRpc from "~/rpc/auth";
import UsersRpc from "~/rpc/users";
import { getCapitalizedWordInitials } from "~/utils/string";

const DEFAULT_USER_BASE = {
	email: "foobar@student.babcock.edu.ng",
	full_name: "Foo Bar",
	id: "foobar",
	matric_no: "00/0000",
	username: "foo-bar",
} as const satisfies UserBaseOutput;

export default function createUserProfile(): AccessorWithLatest<UserBaseOutput> {
	const profile = createAsync(
		async () => {
			const meAuth = await AuthRpc.me.get();

			if (!meAuth.success) return DEFAULT_USER_BASE;

			const { user } = meAuth.res;

			if (user.username === "???")
				user.username = getCapitalizedWordInitials(user.full_name);

			return user;
		},
		{ initialValue: DEFAULT_USER_BASE },
	);

	return profile;
}
