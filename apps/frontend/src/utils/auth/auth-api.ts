type TokenPair = {
	accessToken: string;
	refreshToken: string;
};

type AuthSuccess = {
	ok: true;
	tokens: TokenPair;
};

type AuthFailure = {
	ok: false;
	message: string;
	status?: number;
	bodyText?: string;
};

export type AuthResult = AuthSuccess | AuthFailure;

function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.replace(/\/+$/, "");
}

async function readBodyText(res: Response): Promise<string> {
	try {
		return await res.text();
	} catch {
		return "";
	}
}

function pickMessage(args: {
	statusText: string;
	bodyText: string;
	fallback: string;
}): string {
	const trimmed = args.bodyText.trim();
	if (trimmed.length > 0) return trimmed;
	const st = args.statusText.trim();
	if (st.length > 0) return st;
	return args.fallback;
}

async function postJson<TResponse>(args: {
	baseUrl: string;
	path: string;
	body?: unknown;
}): Promise<{ ok: true; data: TResponse } | { ok: false; error: AuthFailure }> {
	const url = new URL(args.path, `${normalizeBaseUrl(args.baseUrl)}/`).toString();

	let res: Response;
	try {
		res = await fetch(url, {
			body: args.body === undefined ? undefined : JSON.stringify(args.body),
			headers: args.body === undefined ? undefined : { "Content-Type": "application/json" },
			method: "POST",
		});
	} catch (err) {
		const message =
			typeof err === "object" &&
			err !== null &&
			"message" in err &&
			typeof (err as { message?: unknown }).message === "string"
				? String((err as { message: string }).message)
				: "Network request failed";

		return { error: { message, ok: false }, ok: false };
	}

	const bodyText = await readBodyText(res);

	if (!res.ok) {
		return {
			error: {
				bodyText: bodyText.length > 0 ? bodyText : undefined,
				message: pickMessage({
					bodyText,
					fallback: "Request failed",
					statusText: res.statusText,
				}),
				ok: false,
				status: res.status,
			},
			ok: false,
		};
	}

	let json: unknown;
	try {
		json = bodyText.length > 0 ? (JSON.parse(bodyText) as unknown) : null;
	} catch {
		return {
			error: {
				bodyText: bodyText.length > 0 ? bodyText : undefined,
				message: "Response was not valid JSON",
				ok: false,
				status: res.status,
			},
			ok: false,
		};
	}

	return { data: json as TResponse, ok: true };
}

function tokensFromBackendJson(json: unknown): TokenPair | null {
	if (typeof json !== "object" || json === null) return null;

	const access = (json as { access_token?: unknown }).access_token;
	const refresh = (json as { refresh_token?: unknown }).refresh_token;

	if (typeof access !== "string" || access.length === 0) return null;
	if (typeof refresh !== "string" || refresh.length === 0) return null;

	return { accessToken: access, refreshToken: refresh };
}

export async function loginWithEmailPassword(args: {
	baseUrl: string;
	email: string;
	password: string;
}): Promise<AuthResult> {
	const res = await postJson<unknown>({
		baseUrl: args.baseUrl,
		body: { email: args.email, password: args.password },
		path: "/api/v1/auth/login",
	});

	if (!res.ok) return res.error;

	const tokens = tokensFromBackendJson(res.data);
	if (!tokens) {
		return { message: "Backend returned an invalid auth response", ok: false };
	}

	return { ok: true, tokens };
}

export async function registerWithEmailPassword(args: {
	baseUrl: string;
	email: string;
	fullName: string;
	password: string;
}): Promise<AuthResult> {
	const res = await postJson<unknown>({
		baseUrl: args.baseUrl,
		body: { email: args.email, full_name: args.fullName, password: args.password },
		path: "/api/v1/auth/register",
	});

	if (!res.ok) return res.error;

	const tokens = tokensFromBackendJson(res.data);
	if (!tokens) {
		return { message: "Backend returned an invalid auth response", ok: false };
	}

	return { ok: true, tokens };
}

export async function loginAsGuest(args: { baseUrl: string }): Promise<AuthResult> {
	const res = await postJson<unknown>({
		baseUrl: args.baseUrl,
		path: "/api/v1/auth/guest",
	});

	if (!res.ok) return res.error;

	const tokens = tokensFromBackendJson(res.data);
	if (!tokens) {
		return { message: "Backend returned an invalid auth response", ok: false };
	}

	return { ok: true, tokens };
}

export async function loginWithGoogleIdToken(args: {
	baseUrl: string;
	idToken: string;
}): Promise<AuthResult> {
	const token = args.idToken.trim();
	if (token.length === 0) return { message: "Missing Google ID token", ok: false };

	const res = await postJson<unknown>({
		baseUrl: args.baseUrl,
		body: { token },
		path: "/api/v1/auth/google",
	});

	if (!res.ok) return res.error;

	const tokens = tokensFromBackendJson(res.data);
	if (!tokens) {
		return { message: "Backend returned an invalid auth response", ok: false };
	}

	return { ok: true, tokens };
}
