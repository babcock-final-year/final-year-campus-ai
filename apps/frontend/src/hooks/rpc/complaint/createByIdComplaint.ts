import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type { ComplaintResponseOutput } from "~/models/complaint.schemas";
import ComplaintRpc from "~/rpc/complaint";

/**
 * Reactive hook for fetching a single complaint by ID using ComplaintRpc.byId.get.
 * Returns an accessor for the complaint object or null if not found.
 *
 * @param complaintId - The unique identifier of the complaint.
 * @returns AccessorWithLatest<ComplaintResponseOutput | null | undefined>
 */
export default function createByIdComplaint(
	complaintId: number | string,
): AccessorWithLatest<ComplaintResponseOutput | null | undefined> {
	const complaint = createAsync(async () => {
		const res = await ComplaintRpc.byId.get(complaintId);

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return complaint;
}
