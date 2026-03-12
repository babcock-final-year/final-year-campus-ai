import { Link } from "@kobalte/core/link";
import { A } from "@solidjs/router";
import clsx from "clsx/lite";
import {
	ChevronRight,
	type LucideIcon,
	MessageSquare,
	Palette,
	Trash,
	TriangleAlert,
	UserRound,
} from "lucide-solid";
import { createMemo, For } from "solid-js";
import { routes } from "~/RouteManifest";

interface ActionMenuItemProps {
	icon: LucideIcon;
	name: string;
	type?: "normal" | "err";
	route: string;
	onClick?: () => void;
}

function ActionMenuItem(props: ActionMenuItemProps) {
	const isErrBtn = createMemo(() => props.type === "err");

	return (
		<A
			activeClass={isErrBtn() ? "btn-error" : "btn-primary"}
			class={clsx(
				"btn w-auto sm:w-full",
				isErrBtn() ? "btn-error" : "btn-primary",
			)}
			end
			href={props.route}
			inactiveClass={clsx(
				"btn-ghost not-hover:border-base-300 not-hover:bg-secondary",
				!isErrBtn() && "not-hover:text-neutral",
			)}
		>
			<props.icon class="size-5 opacity-50" />

			<p class="text-sm">{props.name}</p>

			{/* If it works, it works */}
			<ChevronRight
				class={clsx("ml-auto size-5 opacity-50", isErrBtn() && "invisible")}
			/>
		</A>
	);
}

/** Will be to the side on desktop, and a horizontal scollable list on mobile */
export default function SettingsActionMenu(props: { class?: string }) {
	const settingsRoutes = routes().home.settings;

	const actionMenuItemProps = [
		{
			icon: UserRound,
			name: "Profile Details",
			route: settingsRoutes.profile.index,
		},
		{
			icon: MessageSquare,
			name: "Contact Support",
			route: settingsRoutes.contact.index,
		},
		{
			icon: TriangleAlert,
			name: "File a Complaint",
			route: settingsRoutes.complaint.index,
		},
		{
			icon: Palette,
			name: "Theme & Interface",
			route: settingsRoutes.theme.index,
		},
		{
			icon: Trash,
			name: "Delete My Data",
			onClick() {
				// TODO: LOgout and delete data
			},
			route: routes().auth.signIn.index,
			type: "err",
		},
	] as const satisfies ActionMenuItemProps[];

	return (
		<div
			class={clsx(
				"flex items-center gap-2 overflow-auto sm:min-w-60 sm:flex-col sm:items-baseline sm:gap-4",
				props.class,
			)}
		>
			<For each={actionMenuItemProps}>
				{(val) => <ActionMenuItem {...val} />}
			</For>
		</div>
	);
}
