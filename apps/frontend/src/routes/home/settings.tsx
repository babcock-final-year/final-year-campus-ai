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

			<div class="grid grid-rows-8 gap-4 overflow-auto bg-base-200 p-8 sm:grid-cols-[16rem_1fr_1fr]">
				<SettingsProfileSummaryCard class="col-start-1 col-end-4 row-start-1 row-end-3" />

				<SettingsActionMenu class="sm:col-start-1 sm:col-end-2 sm:row-start-3 sm:row-end-9" />

				<div class="sm:col-start-2 sm:col-end-4 sm:row-start-3 sm:row-end-9">
					{props.children}
				</div>
			</div>
		</div>
	);
}
