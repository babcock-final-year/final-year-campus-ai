import { Link } from "@kobalte/core/link";
import clsx from "clsx/lite";
import Drawer from "corvu/drawer";
import {
	CirclePlus,
	Ellipsis,
	Folder,
	LogOut,
	PanelLeftClose,
	PanelLeftOpen,
	Settings,
} from "lucide-solid";
import { createSignal, For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import BaseButton from "../button/BaseButton";
import AppLogo from "../svg/AppLogo";

export default function HomeSidebar(props: { isInDrawer?: boolean }) {
	const [isSidebarHiddenInDesktopMode, setIsSidebarHiddenInDesktopMode] =
		createSignal(false);

	let sideBar$!: HTMLDivElement;

	function SidebarHideBtn() {
		function handleHideSidebar() {
			// Do nothing on mobile screens since a drawer will be used instead
			if (window.innerWidth < 640) return;

			if (isSidebarHiddenInDesktopMode()) {
				sideBar$.style.maxWidth = "";
				setIsSidebarHiddenInDesktopMode(false);
			} else {
				sideBar$.style.maxWidth = "3.5rem";
				setIsSidebarHiddenInDesktopMode(true);
			}
		}

		return (
			<BaseButton
				class="btn-circle btn-secondary btn-ghost"
				onClick={handleHideSidebar}
			>
				{isSidebarHiddenInDesktopMode() ? (
					<PanelLeftOpen class="min-w-6" />
				) : (
					<PanelLeftClose class="min-w-6" />
				)}
			</BaseButton>
		);
	}

	return (
		<div
			class={clsx(
				"flex h-screen w-2xs flex-col gap-4 overflow-auto py-4",
				!isSidebarHiddenInDesktopMode() && "px-2",
			)}
			ref={sideBar$}
		>
			<div class="flex items-center gap-4 px-2">
				<Show when={!isSidebarHiddenInDesktopMode()}>
					<AppLogo class="outline outline-accent-content/25 backdrop-brightness-125 *:size-6 *:fill-accent-content" />

					<h2 class="font-semibold text-accent-content text-xl">Unipal</h2>
				</Show>

				<Dynamic
					class={clsx(!isSidebarHiddenInDesktopMode() && "ml-auto")}
					component={props.isInDrawer ? Drawer.Close : "div"}
				>
					<SidebarHideBtn />
				</Dynamic>
			</div>

			<Show when={!isSidebarHiddenInDesktopMode()}>
				<ul class="menu w-full px-0">
					<li>
						<BaseButton class="btn-secondary btn-ghost justify-start gap-4">
							<CirclePlus />
							New Chat
						</BaseButton>
					</li>

					<li>
						<BaseButton class="btn-secondary btn-ghost justify-start gap-4">
							<Folder />
							New Project
						</BaseButton>
					</li>
				</ul>

				<div class="flex grow flex-col overflow-auto text-accent-content/50">
					<h3 class="px-4 text-sm">Recent Chats</h3>

					<ul class="menu w-full px-0">
						<For
							each={[
								"Average School Tuition Fees for 2024",
								"What is Chapel Seminar?",
								"Average School Tuition Fees for 2024",
								"What is Chapel Seminar?",
								"Average School Tuition Fees for 2024",
								"What is Chapel Seminar?",
								"Average School Tuition Fees for 2024",
								"What is Chapel Seminar?",
								"Average School Tuition Fees for 2024",
								"What is Chapel Seminar?",
								"Average School Tuition Fees for 2024",
								"What is Chapel Seminar?",
								"Average School Tuition Fees for 2024",
								"What is Chapel Seminar?",
								"Average School Tuition Fees for 2024",
								"What is Chapel Seminar?",
								"Average School Tuition Fees for 2024",
								"What is Chapel Seminar?",
								"Average School Tuition Fees for 2024",
								"What is Chapel Seminar?",
								"Average School Tuition Fees for 2024",
								"What is Chapel Seminar?",
							]}
						>
							{(chatSummary) => (
								<li class="w-full">
									<Link
										class="btn btn-secondary btn-ghost group w-full justify-start gap-2 text-left font-normal"
										href="#"
									>
										<span class="grow truncate">{chatSummary}</span>
										<Ellipsis class="hidden min-w-6 group-hover:block" />
									</Link>
								</li>
							)}
						</For>
					</ul>
				</div>

				<ul class="menu w-full px-0">
					<li>
						<BaseButton class="btn-secondary btn-ghost justify-start gap-4 font-normal">
							<Settings />
							Settings & Help
						</BaseButton>
					</li>
					<li>
						<BaseButton class="btn-error btn-ghost justify-start gap-4 font-normal">
							<LogOut />
							Logout
						</BaseButton>
					</li>
				</ul>
			</Show>
		</div>
	);
}
