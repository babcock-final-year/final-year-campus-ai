import { TextField } from "@kobalte/core/text-field";
import { Plus } from "lucide-solid";
import { onMount } from "solid-js";
import BaseButton from "../button/BaseButton";

export default function ChatMainAreaFooter() {
	let chatInput$!: HTMLInputElement;

	onMount(() => {
		// Focus on the input field for ux
		chatInput$.focus();
	});

	return (
		<div class="flex items-center justify-center gap-4">
			<BaseButton class="btn-secondary btn-circle">
				<Plus />
			</BaseButton>

			<TextField class="w-5/6 max-w-xl">
				<TextField.Label class="input input-primary w-full">
					<span class="label text-primary/75">Ask</span>

					<TextField.Input
						placeholder="Anything!"
						ref={chatInput$}
						type="text"
					/>
				</TextField.Label>
			</TextField>
		</div>
	);
}
