import { Link } from "@kobalte/core/link";
import { useNavigate } from "@solidjs/router";
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
import { createSignal, For, Show, Suspense } from "solid-js";
import { Dynamic } from "solid-js/web";
import { useChatContext } from "~/context/ChatContextProvider";
import { useToastContext } from "~/context/ToastContextProvider";
import createChatsHistory from "~/hooks/rpc/history/createChatsHistory";
import createUserProfile from "~/hooks/rpc/users/createUserProfile";
import { routes } from "~/RouteManifest";
import ChatRpc from "~/rpc/chat";
import HistoryRpc from "~/rpc/history";
import { revalidateChatData } from "~/rpc/revalidate-query";
import BaseButton from "../ui/button/BaseButton";
import UserProfileImage from "../ui/image/UserProfileImage";
import AppLogo from "../ui/svg/AppLogo";

const NEW_CHAT_NAMES = [
	"New Chat",
	"New Conversation",
	"New Discussion",
] as const;

function getNewChatName() {
	return (
		NEW_CHAT_NAMES[Math.round((NEW_CHAT_NAMES.length - 1) * Math.random())] ??
		NEW_CHAT_NAMES[0]
	);
}

export default function HomeSidebar(props: { isInDrawer?: boolean }) {
	const userProfile = createUserProfile();
	const chatHistory = createChatsHistory();

	const {
		chat: [_, setChat],
	} = useChatContext();
	const toast = useToastContext();
	const navigate = useNavigate();

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

	async function handleCreateNewChat() {
		// Todo: prompt the user for the chat name / auto-infer it later
		const res = await ChatRpc.post({ title: getNewChatName() });
		console.log(res);

		if (!res.success) {
			toast.showToast({
				class: { alert: "alert-error", closeBtn: "btn-error" },
				description:
					res.err.message ??
					"An unexpected error occurred while creating the chat.",
				title: "Failed to create chat",
			});
			return;
		}

		await revalidateChatData();

		setChat(res.res);
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
						<BaseButton
							class="btn-secondary btn-ghost justify-start gap-4"
							onClick={handleCreateNewChat}
						>
							<CirclePlus />
							New Chat
						</BaseButton>
					</li>

					{/*<li>
						<BaseButton class="btn-secondary btn-ghost justify-start gap-4">
							<Folder />
							New Project
						</BaseButton>
					</li>*/}
				</ul>

				<div class="flex grow flex-col overflow-auto text-accent-content/50">
					<h3 class="px-4 text-sm">Recent Chats</h3>

					<ul class="menu w-full px-0">
						<Suspense>
							<For
								each={!userProfile.latest.is_guest && chatHistory.latest?.chats}
							>
								{(chat) => (
									<li class="w-full">
										<BaseButton
											class="btn-secondary btn-ghost group w-full justify-start gap-2 text-left font-normal"
											onClick={async () => {
												const res = await ChatRpc.get(chat.id);

												if (!res.success) return;

												setChat(res.res);

												navigate(routes().home.chat.index);
											}}
										>
											<span class="grow truncate">{chat.title}</span>
											<Ellipsis class="hidden min-w-6 group-hover:block" />
										</BaseButton>
									</li>
								)}
							</For>
						</Suspense>
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
					<Suspense>
						<UserProfileImage
							class={{
								fallback: "bg-secondary/25 font-semibold text-secondary",
								wrapper: "col-start-1 row-span-2 aspect-square h-auto w-full",
							}}
						/>
					</Suspense>

					<h3 class="col-start-2 row-start-1 truncate font-semibold text-secondary">
						<Suspense>{userProfile.latest.full_name}</Suspense>
					</h3>

					<p class="col-start-2 row-start-2 truncate text-secondary opacity-25">
						<Suspense>{userProfile.latest.email}</Suspense>
					</p>
				</div>
			</Show>
		</div>
	);
}
