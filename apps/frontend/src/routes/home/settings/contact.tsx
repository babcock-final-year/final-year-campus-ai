import { Alert } from "@kobalte/core/alert";
import { Link } from "@kobalte/core/link";
import { Info } from "lucide-solid";
import createContactEmail from "~/hooks/contact/createContactEmail";

export default function SettingsInterfaceContactPage() {
	const contactEmail = createContactEmail();

	return (
		<div class="flex size-full p-4">
			<Alert
				class="alert alert-info h-fit grid-cols-[1.5rem_1fr] grid-rows-[1.5rem_1fr] bg-info/25"
				role="alert"
			>
				<Info class="col-start-1 row-start-1" />

				<h2 class="col-start-2 row-start-1 font-semibold">
					Contact Us Directly
				</h2>

				<p class="col-start-2 row-start-2">
					For urgent academic inquiries or administrative issues, you can also
					reach us directly at{" "}
					<Link class="link link-primary" href={`mailto:${contactEmail()}`}>
						{contactEmail()}
					</Link>
					. Our support team typically responds within 24 hours.
				</p>
			</Alert>
		</div>
	);
}
