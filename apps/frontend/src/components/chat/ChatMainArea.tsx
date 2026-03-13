import ChatMainAreaChatList from "./ChatMainAreaChatList";
import ChatMainAreaFooter from "./ChatMainAreaFooter";
import HomeMainAreaHeader from "./ChatMainAreaHeader";

export default function ChatMainArea(props: { chatId?: string | null }) {
	return (
		<div class="grid size-full grid-rows-[3.5rem_1fr_7rem] bg-base-200">
			<HomeMainAreaHeader />
			<ChatMainAreaChatList chatId={props.chatId ?? null} />
			<ChatMainAreaFooter chatId={props.chatId ?? null} />
		</div>
	);
}
