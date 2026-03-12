import { TextField } from "@kobalte/core/text-field";
import { Mic, Plus, SendHorizontal } from "lucide-solid";
import { onMount } from "solid-js";
import BaseButton from "../ui/button/BaseButton";

export default function ChatMainAreaFooter() {
	return (
		<TextField class="items-center-safe flex flex-col gap-4 pt-2">
			<TextField.Label class="input h-12 w-5/6 max-w-3xl border-transparent shadow outline-2 outline-primary/25">
				<BaseButton class="btn-primary btn-circle btn-ghost btn-sm">
					<Plus />
				</BaseButton>

				<TextField.Input
					autofocus
					placeholder="Ask Unipal anything..."
					type="text"
				/>

				{/* TODO: add speech to text */}
				<BaseButton class="btn-circle btn-ghost btn-sm ml-auto">
					<Mic class="opacity-75" />
				</BaseButton>

				<BaseButton class="btn-square btn-primary btn-sm">
					<SendHorizontal />
				</BaseButton>
			</TextField.Label>

			<p class="text-primary/50 text-xs">
				UNIPAL CAN MAKE MISTAKES. CHECK IMPORTANT INFO.
			</p>
		</TextField>
	);
}
