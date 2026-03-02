import { Image } from "@kobalte/core/image";
import clsx from "clsx/lite";
import { Copy, ThumbsDown, ThumbsUp } from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";
import createUserChatHistory from "~/hooks/chat/createUserChatHistory";
import BaseButton from "../ui/button/BaseButton";
import UserProfileImage from "../ui/image/UserProfileImage";
import AppLogo from "../ui/svg/AppLogo";

function AssistantReplyButtons(props: { txt: string }) {
	const [likeState, setLikeState] = createSignal<"like" | "dislike" | "null">(
		"null",
	);

	const handleLike = () => {
		switch (likeState()) {
			case "like":
				setLikeState("null");
				return;
			default:
				setLikeState("like");
				return;
		}
	};

	const handleDislike = () => {
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
			>
				<Copy />
			</BaseButton>

			{/* TODO: connect to the like / dislike api */}
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
	const userChatHistory = createUserChatHistory();

	return (
		<main class="my-4 overflow-auto px-4 py-4 sm:px-8">
			<For each={userChatHistory()?.messages}>
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

								{/* Extra btns for assistant chat bubbles */}
								<Show when={!isUser()}>
									<AssistantReplyButtons txt={val.content} />
								</Show>
							</div>
						</div>
					);
				}}
			</For>
		</main>
	);
}
