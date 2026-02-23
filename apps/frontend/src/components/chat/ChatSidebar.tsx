import { Button } from "@kobalte/core/button";
import { Link } from "@kobalte/core/link";
import { TextField } from "@kobalte/core/text-field";
import Drawer from "corvu/drawer";
import {
	Ellipsis,
	FilePen,
	Folder,
	MessageCircleMore,
	PanelLeftClose,
	PanelLeftOpen,
	Search,
	Settings,
} from "lucide-solid";
import { createSignal, For, Show } from "solid-js";
import BaseButton from "../button/BaseButton";

export default function ChatSidebar(props: { isInDrawer?: boolean }) {
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
			<BaseButton class="btn-ghost btn-circle" onClick={handleHideSidebar}>
				{isSidebarHiddenInDesktopMode() ? (
					<PanelLeftOpen class="min-w-6 text-secondary hover:text-base-content" />
				) : (
					<PanelLeftClose class="min-w-6 text-secondary hover:text-base-content" />
				)}
			</BaseButton>
		);
	}

	return (
		<div
			class="flex h-screen w-2xs flex-col gap-8 overflow-auto px-2 py-8"
			ref={sideBar$}
		>
			<div class="flex items-center justify-center gap-4">
				<Show when={!isSidebarHiddenInDesktopMode()}>
					<TextField>
						<TextField.Label class="input input-secondary rounded-full bg-base-100">
							<Search class="opacity-50" />

							<TextField.Input placeholder="Search" type="search" />
						</TextField.Label>
					</TextField>
				</Show>

				{props.isInDrawer ? (
					<Drawer.Close>
						<SidebarHideBtn />
					</Drawer.Close>
				) : (
					<SidebarHideBtn />
				)}
			</div>

			<Show when={!isSidebarHiddenInDesktopMode()}>
				<ul class="menu w-full px-0 [--menu-active-bg:var(--color-accent)] [--menu-active-fg:var(--color-accent-content)]">
					<li>
						<Button class="px-0 font-semibold text-secondary">
							<FilePen />
							New Chat
						</Button>
					</li>

					<li>
						<Button class="px-0 font-semibold text-secondary">
							<Folder />
							New Project
						</Button>
					</li>
				</ul>

				<div class="flex flex-col text-secondary">
					<h3 class="flex items-center gap-2 font-semibold">
						<MessageCircleMore /> Recent Chats
					</h3>

					<ul class="menu w-full px-0 font-semibold text-sm [--menu-active-bg:var(--color-accent)] [--menu-active-fg:var(--color-accent-content)]">
						<For
							each={[
								"Average School Fees for 2024 adsddsddqdwdq",
								"What is Chapel Seminar?",
							]}
						>
							{(chatSummary) => (
								<li class="w-full">
									<Link class="flex w-full gap-2" href="#">
										<span class="grow truncate">{chatSummary}</span>
										<Ellipsis class="min-w-6" />
									</Link>
								</li>
							)}
						</For>
					</ul>
				</div>

				<ul class="menu mt-auto w-full px-0 font-semibold [--menu-active-bg:var(--color-accent)] [--menu-active-fg:var(--color-accent-content)]">
					<li>
						<Button class="flex px-0 text-secondary">
							<Settings />
							Settings & Help
						</Button>
					</li>
				</ul>
			</Show>
		</div>
	);
}
