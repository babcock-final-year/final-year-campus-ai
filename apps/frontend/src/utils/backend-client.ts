import { getBackendBaseUrl } from "~/constants/env";
import { getAccessToken, getRefreshToken, setAuthTokens } from "./auth-tokens";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type BackendClientError =
	| {
			kind: "network";
			message: string;
			method: HttpMethod;
			url: string;
			cause: unknown;
	  }
	| {
			kind: "parse";
			message: string;
			method: HttpMethod;
			url: string;
			status: number;
			text: string;
	  }
	| {
			kind: "http";
			message: string;
			method: HttpMethod;
			url: string;
			status: number;
			body: unknown;
	  };

export type BackendClientResult<T> =
	| { ok: true; data: T; status: number }
	| { ok: false; error: BackendClientError; status?: number };

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function assertBrowser(): void {
	if (typeof window === "undefined") {
		throw new Error("backendClient can only be used in the browser");
	}
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
	const base = baseUrl.replace(/\/+$/, "");
	const p = path.startsWith("/") ? path : `/${path}`;
	const url = new URL(`${base}${p}`);

	if (query) {
		for (const [k, v] of Object.entries(query)) {
			if (v === undefined || v === null) continue;
			url.searchParams.set(k, String(v));
		}
	}

	return url.toString();
}

async function readJsonSafe(
	res: Response,
): Promise<{ ok: true; json: unknown } | { ok: false; text: string }> {
	const text = await res.text();
	if (!text) return { json: null, ok: true };

	try {
		return { json: JSON.parse(text) as unknown, ok: true };
	} catch {
		return { ok: false, text };
	}
}

function getBearerHeader(): Record<string, string> {
	const token = getAccessToken();
	if (!token) return {};
	return { Authorization: `Bearer ${token}` };
}

async function tryRefresh(baseUrl: string): Promise<boolean> {
	const refresh = getRefreshToken();
	if (!refresh) return false;

	const url = buildUrl(baseUrl, "/api/v1/auth/refresh");

	let res: Response;
	try {
		res = await fetch(url, {
			headers: { Authorization: `Bearer ${refresh}` },
			method: "POST",
		});
	} catch {
		return false;
	}

	if (!res.ok) return false;

	const parsed = await readJsonSafe(res);
	if (!parsed.ok) return false;

	const access_token =
		typeof parsed.json === "object" &&
		parsed.json !== null &&
		"access_token" in parsed.json
			? (parsed.json as { access_token?: unknown }).access_token
			: null;

	if (typeof access_token !== "string" || access_token.length === 0)
		return false;

	setAuthTokens({
		accessToken: access_token,
		refreshToken: refresh,
	});

	return true;
}

async function requestOnce<TResponse, TBody>(args: {
	baseUrl: string;
	method: HttpMethod;
	path: string;
	query?: QueryParams;
	body?: TBody;
	headers?: Record<string, string>;
}): Promise<BackendClientResult<TResponse>> {
	const url = buildUrl(args.baseUrl, args.path, args.query);

	const headers: Record<string, string> = {
		...getBearerHeader(),
		...(args.headers ?? {}),
	};

	const init: RequestInit = {
		headers,
		method: args.method,
	};

	if (args.body !== undefined) {
		headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
		init.body = JSON.stringify(args.body);
	}

	let res: Response;
	try {
		res = await fetch(url, init);
	} catch (cause) {
		return {
			error: {
				cause,
				kind: "network",
				message: "Network request failed",
				method: args.method,
				url,
			},
			ok: false,
		};
	}

	const parsed = await readJsonSafe(res);

	if (!res.ok) {
		const body = parsed.ok ? parsed.json : parsed.text;

		const message =
			typeof body === "object" && body !== null && "message" in body
				? String((body as { message?: unknown }).message ?? "")
				: res.statusText || "Request failed";

		return {
			error: {
				body,
				kind: "http",
				message,
				method: args.method,
				status: res.status,
				url,
			},
			ok: false,
			status: res.status,
		};
	}

	if (!parsed.ok) {
		return {
			error: {
				kind: "parse",
				message: "Response was not valid JSON",
				method: args.method,
				status: res.status,
				text: parsed.text,
				url,
			},
			ok: false,
			status: res.status,
		};
	}

	return { data: parsed.json as TResponse, ok: true, status: res.status };
}

export class BackendClient {
	private readonly baseUrl: string;

	constructor(baseUrl = getBackendBaseUrl()) {
		assertBrowser();
		this.baseUrl = baseUrl;
	}

	async request<TResponse, TBody = never>(args: {
		method: HttpMethod;
		path: string;
		query?: QueryParams;
		body?: TBody;
		headers?: Record<string, string>;
	}): Promise<BackendClientResult<TResponse>> {
		const first = await requestOnce<TResponse, TBody>({
			baseUrl: this.baseUrl,
			...args,
		});

		if (first.ok) return first;

		if (
			first.error.kind !== "http" ||
			first.error.status !== 401 ||
			(args.path === "/api/v1/auth/refresh" && args.method === "POST")
		) {
			return first;
		}

		const refreshed = await tryRefresh(this.baseUrl);
		if (!refreshed) return first;

		return await requestOnce<TResponse, TBody>({
			baseUrl: this.baseUrl,
			...args,
		});
	}

	get<TResponse>(
		path: string,
		query?: QueryParams,
	): Promise<BackendClientResult<TResponse>> {
		return this.request<TResponse>({
			method: "GET",
			path,
			query,
		});
	}

	post<TResponse, TBody>(
		path: string,
		body?: TBody,
	): Promise<BackendClientResult<TResponse>> {
		return this.request<TResponse, TBody>({
			body,
			method: "POST",
			path,
		});
	}

	put<TResponse, TBody>(
		path: string,
		body?: TBody,
	): Promise<BackendClientResult<TResponse>> {
		return this.request<TResponse, TBody>({
			body,
			method: "PUT",
			path,
		});
	}

	patch<TResponse, TBody>(
		path: string,
		body?: TBody,
	): Promise<BackendClientResult<TResponse>> {
		return this.request<TResponse, TBody>({
			body,
			method: "PATCH",
			path,
		});
	}

	delete<TResponse>(path: string): Promise<BackendClientResult<TResponse>> {
		return this.request<TResponse>({
			method: "DELETE",
			path,
		});
	}
}

export const backendClient = new BackendClient();
