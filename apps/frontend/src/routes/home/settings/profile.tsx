import { For, Suspense } from "solid-js";
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
			<div class="wrap-break-word">{props.children}</div>
		</div>
	);
}

export default function SettingsInterfaceProfilePage() {
	const userProfile = createUserProfile();

	const profileDataArray = () =>
		[
			{ children: userProfile.latest.full_name, title: "Full Name" },
			{ children: userProfile.latest.username, title: "Username" },
			{ children: userProfile.latest.matric_no, title: "Matric Number" },
			{
				children: userProfile.latest.email,
				title: "School Email",
			},
		] as const satisfies TitleAndValueProps[];

	return (
		<div class="flex size-full flex-col rounded-box border border-base-300 bg-secondary p-4">
			<h2 class="font-semibold">Profile Details</h2>
			<div class="divider my-2" />
			<div class="grid grid-cols-2 grid-rows-3 gap-6 p-2">
				<Suspense>
					<For each={profileDataArray()}>
						{(val) => (
							<TitleAndValue title={val.title}>{val.children}</TitleAndValue>
						)}
					</For>
				</Suspense>
			</div>
		</div>
	);
}
