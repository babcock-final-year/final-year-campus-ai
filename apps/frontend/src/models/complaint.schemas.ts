import * as v from "valibot";

/**
 * Schema for the request body of POST /complaints
 */
export const ComplaintCreateRequestSchema = v.object({
	description: v.string(),
	title: v.string(),
});

/**
 * Schema for a single complaint object
 */
export const ComplaintResponseSchema = v.object({
	created_at: v.string(), // ISO string
	description: v.string(),
	id: v.number(),
	title: v.string(),
	user_id: v.number(),
});

/**
 * Schema for the response of GET /complaints (list)
 */
export const ComplaintListResponseSchema = v.object({
	complaints: v.array(ComplaintResponseSchema),
});
