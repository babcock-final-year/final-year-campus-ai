import * as v from "valibot";

export const ServerEnvSchema = v.object({
	/** Obtain from https://api.imgbb.com/ */
	IMGBB_API_KEY: v.string(),
	NODE_ENV: v.picklist(["development", "production", "test"]),
});
