"use server";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type ApiError =
	| {
			kind: "http";
			status: number;
			message: string;
			url: string;
			method: HttpMethod;
			body: unknown;
	  }
	| {
			kind: "network";
			message: string;
			url: string;
			method: HttpMethod;
			cause: unknown;
	  }
	| {
			kind: "parse";
			status: number;
			message: string;
			url: string;
			method: HttpMethod;
			text: string;
	  };

export type ApiResult<T> =
	| { ok: true; data: T; status: number }
	| { ok: false; error: ApiError; status?: number };

export type TokenPair = {
	access_token: string;
	refresh_token: string;
};

type ClientOptions = {
	baseUrl: string;
	getAccessToken?: () => Promise<string | null> | string | null;
	getRefreshToken?: () => Promise<string | null> | string | null;
	setTokens?: (tokens: TokenPair) => Promise<void> | void;
};

async function maybePromise<T>(v: T | Promise<T>): Promise<T> {
	return await v;
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

function buildUrl(
	baseUrl: string,
	path: string,
	query?: Record<string, string | number | boolean | null | undefined>,
): string {
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

export class ApiClient {
	private readonly baseUrl: string;
	private readonly getAccessToken?: ClientOptions["getAccessToken"];
	private readonly getRefreshToken?: ClientOptions["getRefreshToken"];
	private readonly setTokens?: ClientOptions["setTokens"];

	constructor(opts: ClientOptions) {
		this.baseUrl = opts.baseUrl;
		this.getAccessToken = opts.getAccessToken;
		this.getRefreshToken = opts.getRefreshToken;
		this.setTokens = opts.setTokens;
	}

	private async authHeader(): Promise<Record<string, string>> {
		if (!this.getAccessToken) return {};

		const token = await maybePromise(this.getAccessToken());
		if (!token) return {};

		return { Authorization: `Bearer ${token}` };
	}

	private async requestOnce<TResponse, TBody>(args: {
		method: HttpMethod;
		path: string;
		query?: Record<string, string | number | boolean | null | undefined>;
		body?: TBody;
		headers?: Record<string, string>;
	}): Promise<ApiResult<TResponse>> {
		const url = buildUrl(this.baseUrl, args.path, args.query);
		const headers: Record<string, string> = {
			...(await this.authHeader()),
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
			const bodyValue = parsed.ok ? parsed.json : parsed.text;

			const message =
				typeof bodyValue === "object" &&
				bodyValue !== null &&
				"message" in bodyValue
					? String((bodyValue as { message?: unknown }).message ?? "")
					: res.statusText || "Request failed";

			return {
				error: {
					body: bodyValue,
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

	private async tryRefresh(): Promise<boolean> {
		if (!this.getRefreshToken || !this.setTokens) return false;

		const refresh = await maybePromise(this.getRefreshToken());
		if (!refresh) return false;

		const res = await this.requestOnce<{ access_token: string }, unknown>({
			headers: { Authorization: `Bearer ${refresh}` },
			method: "POST",
			path: "/api/v1/auth/refresh",
		});

		if (!res.ok) return false;

		const access_token = res.data?.access_token;
		if (!access_token) return false;

		await maybePromise(
			this.setTokens({ access_token, refresh_token: refresh }),
		);
		return true;
	}

	async request<TResponse, TBody = never>(args: {
		method: HttpMethod;
		path: string;
		query?: Record<string, string | number | boolean | null | undefined>;
		body?: TBody;
		headers?: Record<string, string>;
	}): Promise<ApiResult<TResponse>> {
		const first = await this.requestOnce<TResponse, TBody>(args);
		if (first.ok) return first;

		if (first.error.kind !== "http" || first.error.status !== 401) return first;

		const refreshed = await this.tryRefresh();
		if (!refreshed) return first;

		return await this.requestOnce<TResponse, TBody>(args);
	}

	get<TResponse>(
		path: string,
		query?: Record<string, string | number | boolean | null | undefined>,
	): Promise<ApiResult<TResponse>> {
		const args: {
			method: HttpMethod;
			path: string;
			query?: Record<string, string | number | boolean | null | undefined>;
		} = { method: "GET", path };

		if (query !== undefined) args.query = query;

		return this.request<TResponse>(args);
	}

	post<TResponse, TBody>(
		path: string,
		body?: TBody,
	): Promise<ApiResult<TResponse>> {
		const args: {
			method: HttpMethod;
			path: string;
			body?: TBody;
		} = { method: "POST", path };

		if (body !== undefined) args.body = body;

		return this.request<TResponse, TBody>(args);
	}

	put<TResponse, TBody>(
		path: string,
		body?: TBody,
	): Promise<ApiResult<TResponse>> {
		const args: {
			method: HttpMethod;
			path: string;
			body?: TBody;
		} = { method: "PUT", path };

		if (body !== undefined) args.body = body;

		return this.request<TResponse, TBody>(args);
	}

	delete<TResponse>(path: string): Promise<ApiResult<TResponse>> {
		return this.request<TResponse>({ method: "DELETE", path });
	}
}
