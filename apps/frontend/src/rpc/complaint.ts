import { query } from "@solidjs/router";
import * as v from "valibot";
import { SERVER_ENV } from "~/constants/env";
import {
	type ComplaintCreateRequestSchema,
	ComplaintListResponseSchema,
	ComplaintResponseSchema,
} from "~/models/complaint.schemas";
import { coerceToError } from "~/utils/error";
import type { ServerResultResponse } from "./_shared";

/**
 * ComplaintRpc provides type-safe, ergonomic methods for all complaint-related backend routes.
 * Each method is wrapped in SolidStart query for caching/deduplication.
 */
const ComplaintRpc = {
	/**
	 * Return a single complaint if owned by the requester.
	 * @param complaintId - The unique identifier of the complaint.
	 * @returns The complaint object.
	 */
	byId: {
		get: query(
			async (
				complaintId: number | string,
			): Promise<
				ServerResultResponse<v.InferOutput<typeof ComplaintResponseSchema>>
			> => {
				try {
					const res = await fetch(
						`${SERVER_ENV.BACKEND_BASE_URL}/complaints/${encodeURIComponent(String(complaintId))}`,
						{
							credentials: "include",
							method: "GET",
						},
					);
					return {
						res: v.parse(ComplaintResponseSchema, await res.json()),
						success: true,
					};
				} catch (e) {
					return { err: coerceToError(e), success: false };
				}
			},
			"ComplaintRpc.byId.get",
		),
	},

	/**
	 * List complaints for the current user.
	 * @returns An array of complaints for the authenticated user.
	 */
	get: query(
		async (): Promise<
			ServerResultResponse<v.InferOutput<typeof ComplaintListResponseSchema>>
		> => {
			try {
				const res = await fetch(`${SERVER_ENV.BACKEND_BASE_URL}/complaints`, {
					credentials: "include",
					method: "GET",
				});
				return {
					res: v.parse(ComplaintListResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
		"ComplaintRpc.get",
	),

	/**
	 * Create a new complaint for the current authenticated user.
	 * @param createRequest - The complaint details (title, description).
	 * @returns The created complaint object.
	 */
	post: query(
		async (
			createRequest: v.InferInput<typeof ComplaintCreateRequestSchema>,
		): Promise<
			ServerResultResponse<v.InferOutput<typeof ComplaintResponseSchema>>
		> => {
			try {
				const res = await fetch(`${SERVER_ENV.BACKEND_BASE_URL}/complaints`, {
					body: JSON.stringify(createRequest),
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					method: "POST",
				});
				return {
					res: v.parse(ComplaintResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				return { err: coerceToError(e), success: false };
			}
		},
		"ComplaintRpc.post",
	),
} as const;

export default ComplaintRpc;
