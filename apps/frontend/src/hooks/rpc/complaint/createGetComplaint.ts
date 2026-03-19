import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type { ComplaintListResponseOutput } from "~/models/complaint.schemas";
import ComplaintRpc from "~/rpc/complaint";

/**
 * Reactive hook for fetching the current user's complaints list.
 * Returns an accessor for the ComplaintRpc.get() result.
 */
export default function createGetComplaint(): AccessorWithLatest<
	ComplaintListResponseOutput | null | undefined
> {
	const complaints = createAsync(async () => {
		const res = await ComplaintRpc.get();

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return complaints;
}
