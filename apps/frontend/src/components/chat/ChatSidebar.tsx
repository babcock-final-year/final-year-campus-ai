import { TextField } from "@kobalte/core/text-field";
import {
	FilePenLine,
	Folder,
	MessageCircleMore,
	Search,
	Settings,
} from "lucide-solid";
import BaseButton from "../button/BaseButton";

export default function ChatSidebar() {
	return (
		<div class="flex h-screen w-2xs flex-col gap-4 overflow-auto bg-linear-to-b from-sky-900 to-blue-950 px-2 py-8">
			<div class="flex items-center justify-center gap-4">
				<TextField>
					<TextField.Label class="input rounded-full bg-base-100">
						<Search class="opacity-50" />

						<TextField.Input placeholder="Search" type="search" />
					</TextField.Label>
				</TextField>

				<FilePenLine class="size-8 text-primary-content" />
			</div>

			<BaseButton class="btn-ghost mt-4 flex items-center justify-start p-2 font-semibold text-primary-content">
				<FilePenLine />
				New Chat
			</BaseButton>

			<BaseButton class="btn-ghost flex items-center justify-start p-2 font-semibold text-primary-content">
				<Folder />
				New Project
			</BaseButton>

			<div class="mt-8 flex flex-col gap-4 text-primary-content">
				<h3 class="flex items-center gap-4 font-semibold">
					<MessageCircleMore /> Recent Chats
				</h3>

				<ul class="list-none space-y-2 px-2 font-semibold text-sm *:truncate">
					<li>How much is the average school fees </li>
					<li>When is chapel seminar</li>
				</ul>
			</div>

			<BaseButton class="btn-ghost mt-auto flex items-center justify-start p-2 font-semibold text-primary-content">
				<Settings />
				Settings & Help
			</BaseButton>
		</div>
	);
}
