"use server";

import type { UserBase } from "@packages/shared-types";
import { getUserProfileQuery } from "./queries";
export const DEFAULT_USER_PROFILE = {
	avatar_url: null,
	email: "???",
	full_name: "Phenomeman 69420",
	id: "0",
	is_guest: true,
	matric_no: null,
} as const satisfies UserBase;

export async function getUserProfile(): Promise<UserBase> {
	const user = await getUserProfileQuery();

	if (!user) return structuredClone(DEFAULT_USER_PROFILE);

	return user;
}
