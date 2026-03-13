"use server";

import * as v from "valibot";
import { ServerEnvSchema } from "~/models/env";

const SERVER_ENV = v.parse(ServerEnvSchema, process.env);

export function getBackendBaseUrl(): string {
	return SERVER_ENV.VITE_BACKEND_BASE_URL;
}

export function getImgbbApiKey(): string {
	return SERVER_ENV.IMGBB_API_KEY;
}

export function getNodeEnv(): "development" | "production" | "test" {
	return SERVER_ENV.NODE_ENV;
}
