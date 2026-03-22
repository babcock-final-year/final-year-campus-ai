import { Alert } from "@kobalte/core/alert";
import { Link } from "@kobalte/core/link";
import { Info } from "lucide-solid";

export default function SettingsInterfaceContactPage() {
	const contactEmail = "okorochac2064@student.babcock.edu.ng";

	return (
		<div class="flex size-full p-4">
			<Alert
				class="alert alert-info h-fit max-w-full grid-cols-[1.5rem_1fr] grid-rows-[1.5rem_1fr] bg-info/25"
				role="alert"
			>
				<Info class="col-start-1 row-start-1" />

				<h2 class="col-start-2 row-start-1 font-semibold">
					Contact Us Directly
				</h2>

				<p class="wrap-break-word col-start-2 row-start-2 max-w-[62vw]">
					For urgent academic inquiries or administrative issues, you can also
					reach us directly at{" "}
					<Link class="link link-primary" href={`mailto:${contactEmail}`}>
						{contactEmail}
					</Link>
					. Our support team typically responds within 24 hours.
				</p>
			</Alert>
		</div>
	);
}
