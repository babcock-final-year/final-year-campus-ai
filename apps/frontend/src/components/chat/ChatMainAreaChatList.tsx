import { Image } from "@kobalte/core/image";
import clsx from "clsx/lite";
import { createMemo, For, Show } from "solid-js";
import createUserChatHistory from "~/hooks/chat/createUserChatHistory";
import AppLogo from "../svg/AppLogo";

export default function ChatMainAreaChatList() {
	const userChatHistory = createUserChatHistory();

	return (
		<main class="my-4 space-y-4 overflow-auto py-4 pr-4">
			<For each={userChatHistory()?.messages}>
				{(val) => {
					const isUser = createMemo(() => val.role === "user");

					return (
						<div class={clsx("chat", isUser() ? "chat-end" : "chat-start")}>
							<div class="chat-image avatar place-self-start">
								<div class="size-10 rounded-full">
									<Image>
										<Image.Fallback
											class={clsx(
												"size-full",
												isUser() && "grid place-items-center bg-primary",
											)}
										>
											<Show
												fallback={<AppLogo class="*:size-full" />}
												when={isUser()}
											>
												{/*TODO: Make this use the user's initials*/}
												US
											</Show>
										</Image.Fallback>
									</Image>
								</div>
							</div>
							<div
								class={clsx(
									"chat-bubble",
									isUser()
										? "max-w-3/4 rounded-l-field rounded-tr-none rounded-br-box border border-primary/25 bg-base-100"
										: "bg-base-100",
								)}
							>
								{val.content}
							</div>
						</div>
					);
				}}
			</For>
		</main>
	);
}
