import { TextField } from "@kobalte/core/text-field";
import { Mic, Plus, SendHorizontal } from "lucide-solid";
import { createSignal } from "solid-js";
import { useToastContext } from "~/context/ToastContextProvider";
import ChatRpc from "~/rpc/chat";
import BaseButton from "../ui/button/BaseButton";

export default function ChatMainAreaFooter(props: {
	chatId?: number | string | null;
}) {
	const [text, setText] = createSignal("");
	const [isSending, setIsSending] = createSignal(false);
	const toast = useToastContext();

	const send = async () => {
		const content = text().trim();
		if (!content) return;
		if (!props.chatId) {
			// No chat context yet; drop the send.
			return;
		}

		setIsSending(true);

		const res = await ChatRpc.message.post(props.chatId, { content });

		setIsSending(false);

		if (res.success) {
			// clear input on success
			setText("");
		} else {
			// show error toast
			toast.showToast({
				class: { alert: "alert-error", closeBtn: "btn-error" },
				description: res.err.message ?? "Unknown error",
				title: "Failed to send chat message",
			});
			console.error("Failed to send chat message:", res.err);
		}
	};

	return (
		<TextField class="items-center-safe flex flex-col gap-4 pt-2">
			<TextField.Label class="input h-12 w-5/6 max-w-3xl border-transparent shadow outline-2 outline-primary/25">
				<BaseButton class="btn-primary btn-circle btn-ghost btn-sm">
					<Plus />
				</BaseButton>

				<TextField.Input
					autofocus
					onInput={(e) => setText(e.currentTarget.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							send();
						}
					}}
					placeholder="Ask Unipal anything..."
					type="text"
					value={text()}
				/>

				{/*TODO: add txt to speech or abadon this later*/}
				<BaseButton class="btn-circle btn-ghost btn-sm ml-auto" type="button">
					<Mic class="opacity-75" />
				</BaseButton>

				<BaseButton
					class="btn-square btn-primary btn-sm"
					disabled={!props.chatId || isSending()}
					onClick={() => void send()}
				>
					{isSending() ? (
						<span class="loading loading-spinner loading-sm" />
					) : (
						<SendHorizontal />
					)}
				</BaseButton>
			</TextField.Label>

			<p class="text-primary/50 text-xs">
				UNIPAL CAN MAKE MISTAKES. CHECK IMPORTANT INFO.
			</p>
		</TextField>
	);
}
