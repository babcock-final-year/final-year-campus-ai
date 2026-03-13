"use server";

import type {
	AuthResponse,
	PasswordResetRequest,
	UserLoginRequest,
	UserRegisterRequest,
} from "@packages/shared-types";
import { redirect } from "@solidjs/router";
import {
	backendApi,
	backendRoutes,
	clearAuthTokens,
	setAuthTokens,
} from "~/server/api";
import { revalidateChatsList, revalidateUserProfile } from "./queries";

type AuthResult =
	| { ok: true; user: AuthResponse["user"] }
	| { ok: false; message: string };

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

async function onAuthSuccess(resp: AuthResponse): Promise<void> {
	setAuthTokens({
		accessToken: resp.access_token,
		refreshToken: resp.refresh_token,
	});

	await Promise.all([revalidateUserProfile(), revalidateChatsList()]);
}

export async function login(
	input: UserLoginRequest,
	opts?: { redirectTo?: string },
): Promise<AuthResult> {
	const res = await backendApi.post<AuthResponse, UserLoginRequest>(
		backendRoutes.auth.login.build(),
		input,
	);

	if (!res.ok) return { message: messageFromError(res.error), ok: false };

	await onAuthSuccess(res.data);

	if (opts?.redirectTo) throw redirect(opts.redirectTo);

	return { ok: true, user: res.data.user };
}

export async function register(
	input: UserRegisterRequest,
	opts?: { redirectTo?: string },
): Promise<AuthResult> {
	const res = await backendApi.post<AuthResponse, UserRegisterRequest>(
		backendRoutes.auth.register.build(),
		input,
	);

	if (!res.ok) return { message: messageFromError(res.error), ok: false };

	await onAuthSuccess(res.data);

	if (opts?.redirectTo) throw redirect(opts.redirectTo);

	return { ok: true, user: res.data.user };
}

export async function guestLogin(opts?: {
	redirectTo?: string;
}): Promise<AuthResult> {
	const res = await backendApi.post<AuthResponse, undefined>(
		backendRoutes.auth.guest.build(),
		undefined,
	);

	if (!res.ok) return { message: messageFromError(res.error), ok: false };

	await onAuthSuccess(res.data);

	if (opts?.redirectTo) throw redirect(opts.redirectTo);

	return { ok: true, user: res.data.user };
}

export async function logout(opts?: { redirectTo?: string }): Promise<void> {
	await backendApi.post<unknown, undefined>(
		backendRoutes.auth.logout.build(),
		undefined,
	);

	clearAuthTokens();

	await Promise.all([revalidateUserProfile(), revalidateChatsList()]);

	if (opts?.redirectTo) throw redirect(opts.redirectTo);
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
