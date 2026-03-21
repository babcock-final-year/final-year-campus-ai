import { type AccessorWithLatest, createAsync } from "@solidjs/router";
import type {
	ComplaintCreateRequestInput,
	ComplaintResponseOutput,
} from "~/models/complaint.schemas";
import ComplaintRpc from "~/rpc/complaint";

/**
 * Reactive hook for ComplaintRpc.post.
 * Triggers complaint creation and returns the result reactively.
 *
 * @param createRequest - The complaint details (title, description, etc.).
 * @returns AccessorWithLatest<ComplaintResponseOutput | null | undefined>
 */
export default function createPostComplaint(
	createRequest: ComplaintCreateRequestInput,
): AccessorWithLatest<ComplaintResponseOutput | null | undefined> {
	const result = createAsync(async () => {
		const res = await ComplaintRpc.post(createRequest);

		if (res.success) {
			return res.res;
		}
		return null;
	});

	return result;
}
