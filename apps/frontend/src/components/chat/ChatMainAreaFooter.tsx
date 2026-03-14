import { TextField } from "@kobalte/core/text-field";
import type { ChatMessageRequest } from "@packages/shared-types";
import { useNavigate } from "@solidjs/router";
import { Mic, Plus, SendHorizontal } from "lucide-solid";
import { createSignal } from "solid-js";
import { backendClient } from "~/utils/backend-client";
import BaseButton from "../ui/button/BaseButton";

export default function ChatMainAreaFooter(props: { chatId?: string | null }) {
	const navigate = useNavigate();

	const [msg, setMsg] = createSignal("");
	const [isSending, setIsSending] = createSignal(false);

	const sendMessage = async () => {
		const content = msg().trim();
		if (!content) return;
		if (isSending()) return;

		setIsSending(true);
		try {
			let chatId = props.chatId ?? null;

			if (!chatId) {
				const created = await backendClient.post<
					{ chat_id: string; title: string },
					{ title?: string }
				>("/api/v1/chat", undefined);

				if (!created.ok) return;

				chatId = created.data.chat_id;

				if (!chatId) return;
			}

			const res = await backendClient.post<unknown, ChatMessageRequest>(
				`/api/v1/chat/${encodeURIComponent(chatId)}/message`,
				{ content },
			);
			if (!res.ok) return;

			setMsg("");

			window.dispatchEvent(
				new CustomEvent("campus-ai:chat-updated", {
					detail: { chatId },
				}),
			);

			navigate(`/home/chat/${encodeURIComponent(chatId)}`);
		} finally {
			setIsSending(false);
		}
	};

	return (
		<TextField class="items-center-safe flex flex-col gap-4 pt-2">
			<TextField.Label class="input h-12 w-5/6 max-w-3xl border-transparent shadow outline-2 outline-primary/25">
				<BaseButton
					aria-label="Start a new chat"
					class="btn-primary btn-circle btn-ghost btn-sm"
					onClick={() => {
						setMsg("");
						navigate("/home/chat");
					}}
					type="button"
				>
					<Plus />
				</BaseButton>

				<TextField.Input
					autofocus
					disabled={isSending()}
					onInput={(e) => setMsg(e.currentTarget.value)}
					onKeyDown={(e) => {
						if (e.key !== "Enter") return;
						if (e.shiftKey) return;
						e.preventDefault();
						void sendMessage();
					}}
					placeholder="Ask Unipal anything..."
					type="text"
					value={msg()}
				/>

				{/* TODO: add speech to text */}
				<BaseButton class="btn-circle btn-ghost btn-sm ml-auto" type="button">
					<Mic class="opacity-75" />
				</BaseButton>

				<BaseButton
					class="btn-square btn-primary btn-sm"
					disabled={isSending() || msg().trim().length === 0}
					onClick={() => void sendMessage()}
					type="button"
				>
					<SendHorizontal />
				</BaseButton>
			</TextField.Label>

			<p class="text-primary/50 text-xs">
				UNIPAL CAN MAKE MISTAKES. CHECK IMPORTANT INFO.
			</p>
		</TextField>
	);
}
