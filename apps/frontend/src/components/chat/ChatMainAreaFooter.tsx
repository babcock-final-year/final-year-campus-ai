import { TextField } from "@kobalte/core/text-field";
import { Mic, Plus, SendHorizontal } from "lucide-solid";
import { createSignal } from "solid-js";
import { useChatContext } from "~/context/ChatContextProvider";
import { useToastContext } from "~/context/ToastContextProvider";
import ChatRpc from "~/rpc/chat";
import { revalidateChatData } from "~/rpc/revalidate-query";
import BaseButton from "../ui/button/BaseButton";

export default function ChatMainAreaFooter() {
	const [text, setText] = createSignal("");
	const [isSending, setIsSending] = createSignal(false);

	const toast = useToastContext();
	const {
		chat: [chat, setChat],
	} = useChatContext();

	const send = async () => {
		const content = text().trim();
		if (!content) return;

		const id = chat()?.chat_id;
		if (!id) {
			// No chat context yet; drop the send.
			return;
		}

		setIsSending(true);

		const res = await ChatRpc.message.post(id, { content });

		await revalidateChatData();

		const refreshedChatRes = await ChatRpc.get(id);

		if (!refreshedChatRes.success) {
			toast.showToast({
				description: refreshedChatRes.err.message ?? "Unknown error",
				title: "Failed to send chat message",
				type: "error",
			});
			console.error("Failed to send chat message:", refreshedChatRes.err);
			setIsSending(false);
			return;
		}

		setChat(refreshedChatRes.res);

		setIsSending(false);

		if (res.success) {
			// clear input on success
			setText("");
		} else {
			// show error toast
			toast.showToast({
				description: res.err.message ?? "Unknown error",
				title: "Failed to send chat message",
				type: "error",
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
					disabled={!chat()?.chat_id || isSending()}
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
