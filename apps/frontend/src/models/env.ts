import * as v from "valibot";

export const ServerEnvSchema = v.object({
	/** Obtain from https://api.imgbb.com/ */
	IMGBB_API_KEY: v.string(),

	NODE_ENV: v.picklist(["development", "production", "test"]),
	/** Base URL for the backend API (e.g. http://localhost:5000) */
	VITE_BACKEND_BASE_URL: v.pipe(v.string(), v.url()),
});
