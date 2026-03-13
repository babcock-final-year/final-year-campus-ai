import type { UserBase } from "@packages/shared-types";
import { createAsync } from "@solidjs/router";
import { backendClient } from "~/utils/backend-client";

const DEFAULT_USER_PROFILE = {
	avatar_url: null,
	email: "???",
	full_name: "Guest",
	id: "0",
	is_guest: true,
	matric_no: null,
} as const satisfies UserBase;

export default function createUserProfile() {
	const profile = createAsync(
		async () => {
			const res = await backendClient.get<{ user: UserBase }>(
				"/api/v1/auth/me",
			);
			if (!res.ok) return structuredClone(DEFAULT_USER_PROFILE);

			return res.data.user;
		},
		{
			initialValue: DEFAULT_USER_PROFILE,
		},
	);

	return profile;
}
