"use server";

import type { PasswordResetRequest } from "@packages/shared-types";
import { backendApi, backendRoutes } from "~/server/api";

type PasswordResetResult =
	| { ok: true; message: string }
	| { ok: false; message: string };

function messageFromError(error: unknown): string {
	if (typeof error === "string" && error.length > 0) return error;

	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof (error as { message?: unknown }).message === "string"
	) {
		const msg = (error as { message: string }).message;
		if (msg.length > 0) return msg;
	}

	return "Request failed";
}

export async function requestPasswordReset(
	input: PasswordResetRequest,
): Promise<PasswordResetResult> {
	const res = await backendApi.post<{ message: string }, PasswordResetRequest>(
		backendRoutes.auth.resetPassword.build(),
		input,
	);

	if (!res.ok) return { message: messageFromError(res.error), ok: false };

	return {
		message:
			res.data.message ?? "If the email is registered, a reset link was sent.",
		ok: true,
	};
}
