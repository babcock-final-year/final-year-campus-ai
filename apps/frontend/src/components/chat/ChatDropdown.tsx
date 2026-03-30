import * as DropdownMenu from "@kobalte/core/dropdown-menu";
import clsx from "clsx/lite";
import { Trash2 } from "lucide-solid";
import type { JSXElement } from "solid-js";

interface ChatDropdownProps {
	onDelete: () => void;
	/** The btn or whatever to open the dropdown */
	trigger: JSXElement;
	class?: Partial<{ trigger: string }>;
}

export default function ChatDropdown(props: ChatDropdownProps) {
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class={clsx(props.class?.trigger)}>
				{props.trigger}
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					as="ul"
					class="menu rounded-box border border-accent bg-base-300/75 shadow-lg"
				>
					<DropdownMenu.Item
						as="li"
						class="flex items-center gap-2 text-error"
						onSelect={props.onDelete}
					>
						<button type="button">
							<Trash2 /> Delete Chat
						</button>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
