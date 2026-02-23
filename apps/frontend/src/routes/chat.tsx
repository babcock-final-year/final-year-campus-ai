import ChatMainArea from "~/components/chat/ChatMainArea";
import ChatSidebar from "~/components/chat/ChatSidebar";

export default function ChatPage() {
	return (
		<div class="flex size-full">
			<div class="hidden h-full w-fit bg-accent sm:block">
				<ChatSidebar />
			</div>
			<ChatMainArea />
		</div>
	);
}
