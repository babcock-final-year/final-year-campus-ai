import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { useChatContext } from "~/context/ChatContextProvider";
import ChatMainAreaChatList from "./ChatMainAreaChatList";
import ChatMainAreaFooter from "./ChatMainAreaFooter";
import HomeMainAreaHeader from "./ChatMainAreaHeader";

/**
 * Creates a chat when the component mounts and passes the chatId down
 * to the list and footer so they can use the correct chat context.
 */
export default function ChatMainArea() {
	const {
		chat: [chat],
	} = useChatContext();

	createEffect(() => {
		document.title = chat()?.title ?? "";
	});

	onCleanup(() => {
		document.title = "";
	});

	return (
		<div class="grid size-full grid-rows-[3.5rem_1fr_7rem] bg-base-200">
			<HomeMainAreaHeader />
			<ChatMainAreaChatList />
			<ChatMainAreaFooter />
		</div>
	);
}
