import ChatMainAreaChatList from "./ChatMainAreaChatList";
import ChatMainAreaFooter from "./ChatMainAreaFooter";
import ChatMainAreaHeader from "./ChatMainAreaHeader";

export default function ChatMainArea() {
	return (
		<div class="grid size-full grid-rows-[4rem_1fr_7rem] bg-base-200">
			<ChatMainAreaHeader />
			<ChatMainAreaChatList />
			<ChatMainAreaFooter />
		</div>
	);
}
