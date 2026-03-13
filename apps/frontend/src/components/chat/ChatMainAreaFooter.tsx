import { TextField } from "@kobalte/core/text-field";
import type {
	ChatHistoryResponse,
	ChatMessageRequest,
} from "@packages/shared-types";
import { createAsync } from "@solidjs/router";
import { Mic, Plus, SendHorizontal } from "lucide-solid";
import { createSignal, Suspense } from "solid-js";
import { backendClient } from "~/utils/backend-client";
import BaseButton from "../ui/button/BaseButton";

export default function ChatMainAreaFooter(props: { chatId?: string | null }) {
	const [msg, setMsg] = createSignal("");
	const [isSending, setIsSending] = createSignal(false);

	const chatHistory = createAsync(
		async () => {
			const res = await backendClient.get<{ chats: { id: string }[] }>(
				"/api/v1/history/chats",
			);
			if (!res.ok) return null;

			const mostRecent = res.data.chats.at(0);
			if (!mostRecent) return null;

			const messages = await backendClient.get<ChatHistoryResponse>(
				`/api/v1/history/chats/${encodeURIComponent(mostRecent.id)}/messages`,
			);
			if (!messages.ok) return null;

			return messages.data;
		},
		{
			initialValue: null,
		},
	);

	const sendMessage = async () => {
		const content = msg().trim();
		if (!content) return;
		if (isSending()) return;

		setIsSending(true);
		try {
			let chatId = props.chatId ?? null;

			if (!chatId) {
				chatId = chatHistory()?.chat_id ?? null;
			}

			if (!chatId) {
				const created = await backendClient.post<
					{ chat_id: string; title: string },
					{ title?: string }
				>("/api/v1/chat", undefined);

				if (!created.ok) return;

				chatId = created.data.chat_id;
			}

			const res = await backendClient.post<unknown, ChatMessageRequest>(
				`/api/v1/chat/${encodeURIComponent(chatId)}/message`,
				{ content },
			);
			if (!res.ok) return;

			setMsg("");

			if (props.chatId) {
				window.location.reload();
				return;
			}

			window.location.href = `/home/chat/${encodeURIComponent(chatId)}`;
		} finally {
			setIsSending(false);
		}
	};

	return (
		<Suspense>
			<TextField class="items-center-safe flex flex-col gap-4 pt-2">
				<TextField.Label class="input h-12 w-5/6 max-w-3xl border-transparent shadow outline-2 outline-primary/25">
					<BaseButton
						class="btn-primary btn-circle btn-ghost btn-sm"
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
		</Suspense>
	);
}
