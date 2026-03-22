import { Link } from "@kobalte/core/link";
import clsx from "clsx/lite";
import { createResource, For, Suspense } from "solid-js";
import BaseButton from "~/components/ui/button/BaseButton";
import { useToastContext } from "~/context/ToastContextProvider";
import { routes } from "~/RouteManifest";
import ComplaintRpc from "~/rpc/complaint";
import { coerceToError } from "~/utils/error";

function NoComplaintsAvailableDefault() {
	return (
		<div class="p-4 text-sm opacity-70">
			You have not filed any complaints yet.
		</div>
	);
}

/**
 * Simple complaints listing page.
 *
 * - Fetches the authenticated user's complaints via `ComplaintRpc.get`.
 * - Shows a loading state, empty state, and a simple list.
 * - Provides a button to file a new complaint.
 *
 * Keep the UI intentionally minimal so it is easy to extend later.
 */
export default function SettingsComplaintsPage() {
	const toast = useToastContext();

	// Fetcher that surfaces RPC errors as exceptions so the resource can handle loading/error.
	const fetchComplaints = async () => {
		const res = await ComplaintRpc.get();
		if (!res.success) {
			// Surface the error to the UI via toast and throw to mark resource as errored.
			toast.showToast({
				description: res.err.message,
				title: "Failed to load complaints",
				type: "error",
			});
			throw res.err ?? new Error("Failed to list complaints");
		}
		return res.res.complaints;
	};

	const [complaints, { refetch }] = createResource(fetchComplaints);

	return (
		<div
			class={clsx(
				"flex flex-col gap-4 rounded-box border border-base-300 bg-secondary p-4",
			)}
		>
			<div class="flex items-center gap-4">
				<h2 class="font-semibold">Your Complaints</h2>

				<div class="ml-auto flex items-center gap-2">
					<Link
						class="btn btn-ghost hidden sm:inline-flex"
						href={routes().home.settings.complaint.index}
					>
						File a Complaint
					</Link>

					<BaseButton
						class="btn-sm btn-outline"
						onClick={async () => {
							try {
								await refetch();
								toast.showToast({
									description: "Complaints list updated.",
									title: "Refreshed",
									type: "success",
								});
							} catch (e) {
								// refetch already shows toast on RPC failure, but ensure some feedback.
								toast.showToast({
									description:
										coerceToError(e).message ?? "Unable to refresh complaints.",
									title: "Refresh failed",
									type: "error",
								});
							}
						}}
					>
						Refresh
					</BaseButton>
				</div>
			</div>

			<div class="divider my-0" />

			<Suspense fallback={<NoComplaintsAvailableDefault />}>
				<For each={complaints()} fallback={<NoComplaintsAvailableDefault />}>
					{(complaint) => (
						<div class="card w-full bg-base-200 shadow-sm">
							<div class="card-body p-3">
								<div class="flex items-start gap-3">
									<h3 class="font-semibold">{complaint.title}</h3>
								</div>

								<p class="mt-2 text-sm opacity-80">{complaint.description}</p>

								{/* Metadata row */}
								<div class="mt-3 flex items-center gap-2 text-xs opacity-60">
									<span>ID: {complaint.id}</span>
									<span class="divider divider-horizontal mx-0" />
									<span>{complaint.created_at.toLocaleString()}</span>
								</div>
							</div>
						</div>
					)}
				</For>
			</Suspense>
		</div>
	);
}
