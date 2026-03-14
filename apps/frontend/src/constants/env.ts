import * as v from "valibot";
import { ServerEnvSchema } from "~/models/env";

function readBackendBaseUrlFromClientEnv(): string {
	const raw = import.meta.env["VITE_BACKEND_BASE_URL"];
	if (typeof raw === "string" && raw.length > 0) return raw;
	return "http://localhost:5000";
}

function readBackendBaseUrlFromServerEnv(): string {
	const parsed = v.parse(ServerEnvSchema, process.env);
	return parsed.VITE_BACKEND_BASE_URL;
}

function readGoogleClientIdFromClientEnv(): string {
	const raw = import.meta.env["VITE_GOOGLE_CLIENT_ID"];
	if (typeof raw === "string") return raw;
	return "";
}

export function getBackendBaseUrl(): string {
	if (typeof window !== "undefined") return readBackendBaseUrlFromClientEnv();
	return readBackendBaseUrlFromServerEnv();
}

export function getGoogleClientId(): string {
	if (typeof window !== "undefined") return readGoogleClientIdFromClientEnv();
	const parsed = v.parse(ServerEnvSchema, process.env);
	return parsed.VITE_GOOGLE_CLIENT_ID
}

export function getImgbbApiKey(): string {
	const parsed = v.parse(ServerEnvSchema, process.env);
	return parsed.IMGBB_API_KEY;
}

export function getNodeEnv(): "development" | "production" | "test" {
	const parsed = v.parse(ServerEnvSchema, process.env);
	return parsed.NODE_ENV;
}
