import ChatMainAreaChatList from "./ChatMainAreaChatList";
import ChatMainAreaFooter from "./ChatMainAreaFooter";
import HomeMainAreaHeader from "./ChatMainAreaHeader";

export default function ChatMainArea() {
	return (
		<div class="grid size-full grid-rows-[3.5rem_1fr_7rem] bg-base-200">
			<HomeMainAreaHeader />
			<ChatMainAreaChatList />
			<ChatMainAreaFooter />
		</div>
	);
}
