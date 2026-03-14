import * as v from "valibot";

export const ServerEnvSchema = v.object({
	/** Obtain from https://api.imgbb.com/ */
	IMGBB_API_KEY: v.string(),

	NODE_ENV: v.picklist(["development", "production", "test"]),

	/** Base URL for the backend API (e.g. http://localhost:5000) */
	VITE_BACKEND_BASE_URL: v.optional(
		v.pipe(v.string(), v.url()),
		"http://localhost:5000",
	),

	/**
	 * Google Identity Services OAuth 2.0 Client ID.
	 * Used on the client to obtain an ID token, which is then exchanged with the backend at POST /api/v1/auth/google.
	 */
	VITE_GOOGLE_CLIENT_ID: v.optional(v.string(), "154888782911-anj3360m5kq0rpjgvsn1su0gpo1utlmn.apps.googleusercontent.com"),
});
