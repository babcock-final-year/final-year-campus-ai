"use server";

import type { UserBase } from "@packages/shared-types";

export const DEFAULT_USER_PROFILE = {
	email: "???",
	full_name: "Phenomeman 69420",
	id: "0",
	is_guest: true,
} as const satisfies UserBase;

export async function getUserProfile(): Promise<UserBase> {
	// TODO
	return structuredClone(DEFAULT_USER_PROFILE);
}
