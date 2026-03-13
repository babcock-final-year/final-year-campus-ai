import { TextField } from "@kobalte/core/text-field";
import { createAsync } from "@solidjs/router";
import { Mic, Plus, SendHorizontal } from "lucide-solid";
import { createSignal, Suspense } from "solid-js";
import { createChat, postChatMessage } from "~/server/chat";
import {
	getChatMessagesQuery,
	getUserChatHistoryQuery,
	revalidateChatMessages,
	revalidateChatsList,
} from "~/server/queries";
import BaseButton from "../ui/button/BaseButton";

export default function ChatMainAreaFooter(props: { chatId?: string | null }) {
	const [msg, setMsg] = createSignal("");
	const [isSending, setIsSending] = createSignal(false);

	const chatHistory = createAsync(() => getUserChatHistoryQuery(), {
		initialValue: null,
	});

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
				const created = await createChat();
				if (!created) return;

				chatId = created.chat_id;
				await revalidateChatsList();
			}

			const res = await postChatMessage(chatId, { content });
			if (!res) return;

			setMsg("");
			await revalidateChatMessages(chatId);
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
