import ChatMainAreaChatList from "./ChatMainAreaChatList";
import ChatMainAreaFooter from "./ChatMainAreaFooter";
import ChatMainAreaHeader from "./ChatMainAreaHeader";

export default function ChatMainArea() {
	return (
		<div class="grid size-full grid-rows-[2.5rem_1fr_3rem] px-6 py-8">
			<ChatMainAreaHeader />
			<ChatMainAreaChatList />
			<ChatMainAreaFooter />
		</div>
	);
}
