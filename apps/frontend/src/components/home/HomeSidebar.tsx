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
import createChatsHistory from "~/hooks/rpc/history/createChatsHistory";
import createUserProfile from "~/hooks/rpc/users/createUserProfile";
import { routes } from "~/RouteManifest";
import BaseButton from "../ui/button/BaseButton";
import UserProfileImage from "../ui/image/UserProfileImage";
import AppLogo from "../ui/svg/AppLogo";

export default function HomeSidebar(props: { isInDrawer?: boolean }) {
	const userProfile = createUserProfile();
	const chats = createChatsHistory();

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
				"flex h-screen w-2xs flex-col gap-2 overflow-auto py-4",
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
						<For each={chats()?.chats}>
							{(chat) => (
								<li class="w-full">
									<Link
										class="btn btn-secondary btn-ghost group w-full justify-start gap-2 text-left font-normal"
										href="#"
									>
										<span class="grow truncate">{chat.title}</span>
										<Ellipsis class="hidden min-w-6 group-hover:block" />
									</Link>
								</li>
							)}
						</For>
					</ul>
				</div>

				<ul class="menu menu-horizontal w-full justify-around px-0">
					<li>
						<Link
							class="btn btn-secondary btn-ghost justify-start font-normal"
							href={routes().home.settings.profile.index}
						>
							<Settings />
							Settings
						</Link>
					</li>
					<li>
						{/* TODO: Add logout functionality */}
						<Link
							class="btn btn-error btn-ghost justify-start font-normal"
							href={routes().auth.signIn.index}
						>
							<LogOut />
							Logout
						</Link>
					</li>
				</ul>

				{/* User profile shortcut */}
				<div class="grid grid-cols-[3rem_1fr] grid-rows-2 place-content-center gap-x-4 px-2 contain-content">
					<UserProfileImage
						class={{
							fallback: "bg-secondary/25 font-semibold text-secondary",
							wrapper: "col-start-1 row-span-2 aspect-square h-auto w-full",
						}}
					/>

					<h3 class="col-start-2 row-start-1 truncate font-semibold text-secondary">
						{userProfile().full_name}
					</h3>

					<p class="col-start-2 row-start-2 truncate text-secondary opacity-25">
						{userProfile().email}
					</p>
				</div>
			</Show>
		</div>
	);
}
