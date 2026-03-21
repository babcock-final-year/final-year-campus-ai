import type { JSXElement } from "solid-js";
import HomeMainAreaHeader from "~/components/chat/ChatMainAreaHeader";
import SettingsActionMenu from "~/components/settings/SettingsActionMenu";
import SettingsProfileSummaryCard from "~/components/settings/SettingsProfileSummaryCard";

export default function SettingsInterfaceLayout(props: {
	children: JSXElement;
}) {
	return (
		<div class="grid size-full grid-rows-[3.5rem_1fr]">
			<HomeMainAreaHeader />

			<div class="flex flex-col gap-4 overflow-auto bg-base-200 p-4 sm:gap-6 md:p-6">
				<SettingsProfileSummaryCard class="h-36" />

				<div class="contents grow gap-4 sm:flex sm:gap-6">
					<SettingsActionMenu class="w-full sm:w-60" />

					<div class="grow">{props.children}</div>
				</div>
			</div>
		</div>
	);
}
