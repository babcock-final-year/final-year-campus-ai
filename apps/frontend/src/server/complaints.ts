"use server";

import type {
	ComplaintCreateRequest,
	ComplaintListResponse,
	ComplaintResponse,
} from "@packages/shared-types";
import { backendApi, backendRoutes } from "~/server/api";

export async function listComplaints(): Promise<ComplaintListResponse> {
	const res = await backendApi.get<ComplaintListResponse>(
		backendRoutes.complaints.list.build(),
	);

	if (!res.ok) return { complaints: [] };

	return res.data;
}

export async function getComplaint(
	complaint_id: number,
): Promise<ComplaintResponse | null> {
	const res = await backendApi.get<ComplaintResponse>(
		backendRoutes.complaints.get.build({ complaint_id }),
	);

	if (!res.ok) return null;

	return res.data;
}

export async function createComplaint(
	input: ComplaintCreateRequest,
): Promise<ComplaintResponse | null> {
	const res = await backendApi.post<ComplaintResponse, ComplaintCreateRequest>(
		backendRoutes.complaints.create.build(),
		{
			description: input.description.trim(),
			title: input.title.trim(),
		},
	);

	if (!res.ok) return null;

	return res.data;
}
