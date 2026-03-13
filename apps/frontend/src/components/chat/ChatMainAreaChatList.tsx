import { Image } from "@kobalte/core/image";
import type { ChatHistoryResponse } from "@packages/shared-types";
import { createAsync } from "@solidjs/router";
import clsx from "clsx/lite";
import { Copy, ThumbsDown, ThumbsUp } from "lucide-solid";
import { createMemo, createSignal, For, Show, Suspense } from "solid-js";
import { backendClient } from "~/utils/backend-client";
import BaseButton from "../ui/button/BaseButton";
import UserProfileImage from "../ui/image/UserProfileImage";
import AppLogo from "../ui/svg/AppLogo";

function AssistantReplyButtons(props: {
	chatId: string;
	msgId: number;
	txt: string;
}) {
	const [likeState, setLikeState] = createSignal<"like" | "dislike" | "null">(
		"null",
	);

	const [isSubmitting, setIsSubmitting] = createSignal(false);

	const handleLike = async () => {
		if (isSubmitting()) return;

		const next = likeState() === "like" ? "null" : "like";
		setIsSubmitting(true);

		try {
			const res = await backendClient.post<unknown, { like: boolean }>(
				`/api/v1/history/chats/${encodeURIComponent(props.chatId)}/messages/${props.msgId}/like`,
				{ like: next === "like" },
			);
			if (!res.ok) return;

			setLikeState(next);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDislike = () => {
		// Backend only supports boolean is_liked; no dislike state exists server-side.
		// We keep this as a local UI toggle so you still get the interaction affordance.
		switch (likeState()) {
			case "dislike":
				setLikeState("null");
				return;
			default:
				setLikeState("dislike");
				return;
		}
	};

	return (
		<div class="*:btn-ghost *:btn-xs *:btn-square absolute mt-2 flex gap-2">
			<BaseButton
				aria-label="Copy the assistant's reply"
				class="btn-primary"
				onClick={() => navigator.clipboard.writeText(props.txt)}
				type="button"
			>
				<Copy />
			</BaseButton>

			<BaseButton
				aria-label="Like the assistant's reply"
				disabled={isSubmitting()}
				onClick={handleLike}
				type="button"
			>
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
				type="button"
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

export default function ChatMainAreaChatList(props: {
	chatId?: string | null;
}) {
	const chatHistory = createAsync(
		async () => {
			const id = props.chatId;
			if (typeof id === "string" && id.trim().length > 0) {
				const res = await backendClient.get<ChatHistoryResponse>(
					`/api/v1/history/chats/${encodeURIComponent(id)}/messages`,
				);
				if (!res.ok) return null;

				return res.data;
			}

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
		{ initialValue: null },
	);

	return (
		<Suspense
			fallback={
				<main class="my-4 overflow-auto px-4 py-4 sm:px-8">
					<div class="opacity-60">Loading...</div>
				</main>
			}
		>
			<main class="my-4 overflow-auto px-4 py-4 sm:px-8">
				<For each={chatHistory()?.messages ?? []}>
					{(val) => {
						const isUser = createMemo(() => val.role === "user");

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
									{val.content}

									<Show when={!isUser()}>
										<AssistantReplyButtons
											chatId={chatHistory()?.chat_id ?? ""}
											msgId={val.id}
											txt={val.content}
										/>
									</Show>
								</div>
							</div>
						);
					}}
				</For>
			</main>
		</Suspense>
	);
}
