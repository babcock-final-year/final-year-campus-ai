import { For } from "solid-js";
import createUserProfile from "~/hooks/rpc/users/createUserProfile";

interface TitleAndValueProps {
	title: string;
	children: string;
}

function TitleAndValue(props: TitleAndValueProps) {
	return (
		<div class="space-y-2">
			<div class="font-semibold text-xs opacity-75">
				{props.title.toUpperCase()}
			</div>
			<div>{props.children}</div>
		</div>
	);
}

export default function SettingsInterfaceProfilePage() {
	const userProfile = createUserProfile();

	// TODO
	const profileDataArray = [
		{ children: userProfile().full_name, title: "Full Name" },
		{ children: "22/1234", title: "Matric Number" },
		{
			children: userProfile().email ?? "blaa@student.babcock.edu.ng",
			title: "School Email",
		},
	] as const satisfies TitleAndValueProps[];

	return (
		<div class="flex size-full flex-col rounded-box border border-base-300 bg-secondary p-4">
			<h2 class="font-semibold">Profile Details</h2>
			<div class="divider my-2" />
			<div class="grid grid-cols-2 grid-rows-3 gap-6 p-2">
				<For each={profileDataArray}>
					{(val) => (
						<TitleAndValue title={val.title}>{val.children}</TitleAndValue>
					)}
				</For>
			</div>
		</div>
	);
}
