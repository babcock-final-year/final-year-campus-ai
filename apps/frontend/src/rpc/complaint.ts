import { query } from "@solidjs/router";
import * as v from "valibot";
import { useToastContext } from "~/context/ToastContextProvider";
import {
	type ComplaintCreateRequestInput,
	ComplaintCreateRequestSchema,
	type ComplaintListResponseOutput,
	ComplaintListResponseSchema,
	type ComplaintResponseOutput,
	ComplaintResponseSchema,
} from "~/models/complaint.schemas";
import { getClientEnv } from "~/utils/env";
import { coerceToError } from "~/utils/error";
import type { ServerResultResponse } from "./_shared";
import fetchWithAuth from "./fetchWithAuth";

/**
 * ComplaintRpc provides type-safe, ergonomic methods for all complaint-related backend routes.
 * Each method is wrapped in SolidStart query for caching/deduplication.
 */
const BASE_PATH =
	`${getClientEnv().VITE_BACKEND_BASE_URL}/api/v1/complaints` as const;

/**
 * Attempt to show an error toast if the toast context is available.
 *
 * We deliberately guard the `useToastContext` call so RPCs can still be used
 * in contexts where Solid's context is not available (e.g. server-side or
 * non-component usage) without throwing.
 */
function tryShowErrorToast(title: string, err: unknown) {
	try {
		const toast = useToastContext();
		const error = coerceToError(err);
		toast.showToast({
			class: { alert: "alert-error", closeBtn: "btn-error" },
			description: error.message ?? "An unexpected error occurred.",
			title,
		});
	} catch {
		// swallow: toast context not available in current runtime context
		// leave error handling to the caller
	}
}

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
			): Promise<ServerResultResponse<ComplaintResponseOutput>> => {
				try {
					const res = await fetchWithAuth(
						`${BASE_PATH}/${encodeURIComponent(String(complaintId))}`,
						{ method: "GET" },
					);
					return {
						res: v.parse(ComplaintResponseSchema, await res.json()),
						success: true,
					};
				} catch (e) {
					tryShowErrorToast("Failed to fetch complaint", e);
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
		async (): Promise<ServerResultResponse<ComplaintListResponseOutput>> => {
			try {
				const res = await fetchWithAuth(BASE_PATH, { method: "GET" });
				return {
					res: v.parse(ComplaintListResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				tryShowErrorToast("Failed to list complaints", e);
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
			createRequest: ComplaintCreateRequestInput,
		): Promise<ServerResultResponse<ComplaintResponseOutput>> => {
			try {
				const res = await fetchWithAuth(BASE_PATH, {
					body: JSON.stringify(
						v.parse(ComplaintCreateRequestSchema, createRequest),
					),
					headers: { "Content-Type": "application/json" },
					method: "POST",
				});
				return {
					res: v.parse(ComplaintResponseSchema, await res.json()),
					success: true,
				};
			} catch (e) {
				tryShowErrorToast("Failed to create complaint", e);
				return { err: coerceToError(e), success: false };
			}
		},
		"ComplaintRpc.post",
	),
} as const;

export default ComplaintRpc;
