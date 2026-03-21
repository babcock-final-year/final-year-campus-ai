import { Image } from "@kobalte/core/image";
import clsx from "clsx/lite";
import { Copy, ThumbsDown, ThumbsUp } from "lucide-solid";
import {
	createEffect,
	createMemo,
	createSignal,
	Index,
	on,
	Show,
} from "solid-js";
import { reconcile } from "solid-js/store";
import { useChatContext } from "~/context/ChatContextProvider";
import type { ChatMessageOutput } from "~/models/chat.schemas";
import HistoryRpc from "~/rpc/history";
import BaseButton from "../ui/button/BaseButton";
import UserProfileImage from "../ui/image/UserProfileImage";
import AppLogo from "../ui/svg/AppLogo";

function AssistantReplyButtons(props: {
	txt: string;
	chatId?: number | string;
	msgId?: number | string;
}) {
	const [likeState, setLikeState] = createSignal<"like" | "dislike" | "null">(
		"null",
	);

	const handleLike = async () => {
		// If chatId/msgId not provided, fall back to local toggle only
		if (!props.chatId || !props.msgId) {
			switch (likeState()) {
				case "like":
					setLikeState("null");
					return;
				default:
					setLikeState("like");
					return;
			}
		}

		try {
			const current = likeState();

			// If currently liked, unset (send like: false)
			if (current === "like") {
				const res = await HistoryRpc.message.like.post(
					props.chatId,
					props.msgId,
					{ like: false },
				);
				if (res.success) {
					setLikeState("null");
				}
			} else {
				// Otherwise set like: true
				const res = await HistoryRpc.message.like.post(
					props.chatId,
					props.msgId,
					{ like: true },
				);
				if (res.success) {
					setLikeState("like");
				}
			}
		} catch (e) {
			// Best-effort local fallback
			switch (likeState()) {
				case "like":
					setLikeState("null");
					return;
				default:
					setLikeState("like");
					return;
			}
		}
	};

	const handleDislike = async () => {
		// If chatId/msgId not provided, fall back to local toggle only
		if (!props.chatId || !props.msgId) {
			switch (likeState()) {
				case "dislike":
					setLikeState("null");
					return;
				default:
					setLikeState("dislike");
					return;
			}
		}

		try {
			const current = likeState();

			// Backend only stores is_liked boolean, so we map 'dislike' to sending like:false.
			if (current === "dislike") {
				const res = await HistoryRpc.message.like.post(
					props.chatId,
					props.msgId,
					{ like: false },
				);
				if (res.success) setLikeState("null");
			} else {
				const res = await HistoryRpc.message.like.post(
					props.chatId,
					props.msgId,
					{ like: false },
				);
				if (res.success) setLikeState("dislike");
			}
		} catch (e) {
			// Best-effort local fallback
			switch (likeState()) {
				case "dislike":
					setLikeState("null");
					return;
				default:
					setLikeState("dislike");
					return;
			}
		}
	};

	return (
		<div class="*:btn-ghost *:btn-xs *:btn-square absolute mt-2 flex gap-2">
			<BaseButton
				aria-label="Copy the assistant's reply"
				class="btn-primary"
				onClick={() => navigator.clipboard.writeText(props.txt)}
			>
				<Copy />
			</BaseButton>

			<BaseButton aria-label="Like the assistant's reply" onClick={handleLike}>
				<ThumbsUp
					class={clsx(
						"stroke-neutral opacity-75",
						likeState() === "like" && "fill-neutral",
					)}
				/>
			</BaseButton>

			<BaseButton
				aria-label="Dislike the assistant's reply"
				onClick={handleDislike}
			>
				<ThumbsDown
					class={clsx(
						"stroke-neutral opacity-75",
						likeState() === "dislike" && "fill-neutral",
					)}
				/>
			</BaseButton>
		</div>
	);
}

export default function ChatMainAreaChatList() {
	const {
		chat: [chat],
	} = useChatContext();

	const messages = createMemo<ChatMessageOutput[]>(
		(_prev) => {
			const prev = _prev ?? [];

			const _chat = chat();
			if (!_chat) return prev;

			// TODO: check if this works
			return reconcile(_chat.messages, { merge: true })(prev);
		},
		[],
		{ equals: false },
	);

	let chatMessageContainer$!: HTMLDivElement;

	createEffect(
		on(messages, () => {
			chatMessageContainer$.scrollTo({
				behavior: "smooth",
				top: chatMessageContainer$.scrollHeight,
			});
		}),
	);

	return (
		<main
			class="my-4 overflow-auto px-4 py-4 sm:px-8"
			ref={chatMessageContainer$}
		>
			<Index each={messages()}>
				{(val) => {
					const isUser = createMemo(() => val().role === "user");

					return (
						<div
							class={clsx(
								"chat",
								isUser() ? "chat-end mb-4" : "chat-start mb-8",
							)}
						>
							<Show
								fallback={
									<div class="chat-image avatar place-self-start">
										<div class="size-10 rounded-full">
											<Image>
												<Image.Fallback class="size-full">
													<AppLogo class="bg-primary *:size-full *:fill-primary-content" />
												</Image.Fallback>
											</Image>
										</div>
									</div>
								}
								when={isUser()}
							>
								<UserProfileImage
									class={{
										fallback: "size-full",
										wrapper: "chat-image size-10 place-self-start",
									}}
								/>
							</Show>
							<div
								class={clsx(
									"chat-bubble",
									isUser()
										? "max-w-3/4 rounded-l-field rounded-tr-none rounded-br-box border border-primary/25 bg-base-100 before:hidden"
										: "bg-base-200",
								)}
							>
								{val().content}

								{/* Extra btns for assistant chat bubbles */}
								<Show when={!isUser()}>
									<AssistantReplyButtons
										chatId={chat()?.chat_id ?? ""}
										msgId={val().id}
										txt={val().content}
									/>
								</Show>
							</div>
						</div>
					);
				}}
			</Index>
		</main>
	);
}
