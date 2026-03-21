import * as v from "valibot";

/**
 * Schema for the request body of POST /complaints
 */
export const ComplaintCreateRequestSchema = v.object({
	description: v.string(),
	title: v.string(),
});
export type ComplaintCreateRequestInput = v.InferInput<
	typeof ComplaintCreateRequestSchema
>;
export type ComplaintCreateRequestOutput = v.InferOutput<
	typeof ComplaintCreateRequestSchema
>;

/**
 * Schema for a single complaint object
 */
export const ComplaintResponseSchema = v.object({
	created_at: v.pipe(v.string(), v.toDate()),
	description: v.pipe(v.string(), v.minLength(3)),
	id: v.number(),
	title: v.pipe(v.string(), v.minLength(3)),
	user_id: v.string(),
});
export type ComplaintResponseInput = v.InferInput<
	typeof ComplaintResponseSchema
>;
export type ComplaintResponseOutput = v.InferOutput<
	typeof ComplaintResponseSchema
>;

/**
 * Schema for the response of GET /complaints (list)
 */
export const ComplaintListResponseSchema = v.object({
	complaints: v.array(ComplaintResponseSchema),
});
export type ComplaintListResponseInput = v.InferInput<
	typeof ComplaintListResponseSchema
>;
export type ComplaintListResponseOutput = v.InferOutput<
	typeof ComplaintListResponseSchema
>;
