import * as v from "valibot";

export const ServerEnvSchema = v.object({
	BACKEND_BASE_URL: v.pipe(v.string(), v.url()),
	/** Obtain from https://api.imgbb.com/ */
	IMGBB_API_KEY: v.string(),
	NODE_ENV: v.picklist(["development", "production", "test"]),
});
export type ServerEnvInput = v.InferInput<typeof ServerEnvSchema>;
export type ServerEnvOutput = v.InferOutput<typeof ServerEnvSchema>;

export const ClientEnvSchema = v.object({
	VITE_BACKEND_BASE_URL: v.pipe(v.string(), v.url()),
	VITE_GOOGLE_CLIENT_ID: v.string(),
});
export type ClientEnvInput = v.InferInput<typeof ClientEnvSchema>;
export type ClientEnvOutput = v.InferOutput<typeof ClientEnvSchema>;
