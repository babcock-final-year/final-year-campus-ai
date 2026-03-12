import { createAsync } from "@solidjs/router";
import { DEFAULT_USER_PROFILE, getUserProfile } from "~/server/user";

export default function createUserProfile() {
	const profile = createAsync(async () => getUserProfile(), {
		initialValue: DEFAULT_USER_PROFILE,
	});

	return profile;
}
