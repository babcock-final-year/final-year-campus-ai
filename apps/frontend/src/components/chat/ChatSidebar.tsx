import { Button } from "@kobalte/core/button";
import { Link } from "@kobalte/core/link";
import { TextField } from "@kobalte/core/text-field";
import {
	Ellipsis,
	FilePen,
	Folder,
	MessageCircleMore,
	Search,
	Settings,
} from "lucide-solid";
import { For } from "solid-js";

export default function ChatSidebar() {
	return (
		<div class="flex h-screen w-2xs flex-col gap-8 overflow-auto px-2 py-8">
			<div class="flex items-center justify-center gap-4">
				<TextField>
					<TextField.Label class="input input-secondary rounded-full bg-base-100">
						<Search class="opacity-50" />

						<TextField.Input placeholder="Search" type="search" />
					</TextField.Label>
				</TextField>

				<FilePen class="mr-2 min-w-6 text-secondary" />
			</div>

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
		</div>
	);
}
