import HomeMainAreaHeader from "~/components/chat/ChatMainAreaHeader";

export default function SettingsInterfacePage() {
	return (
		<div class="grid grid-cols-[3.5rem_1fr]">
			<HomeMainAreaHeader />

			<div class="grid grid-cols-3 grid-rows-4 gap-4"></div>
		</div>
	);
}
