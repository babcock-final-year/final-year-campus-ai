import ChatMainAreaChatList from "./ChatMainAreaChatList";
import ChatMainAreaFooter from "./ChatMainAreaFooter";
import ChatMainAreaHeader from "./ChatMainAreaHeader";

export default function ChatMainArea() {
	return (
		<div class="grid size-full grid-rows-[1.5rem_1fr_1.5rem] p-4">
			<ChatMainAreaHeader />
			<ChatMainAreaChatList />
			<ChatMainAreaFooter />
		</div>
	);
}
