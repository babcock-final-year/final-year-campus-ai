import { JSXElement, createSignal, useContext } from "solid-js";
import { ChatContext } from "./ChatContext";
import { ChatCreateResponseOutput } from "~/models/chat.schemas";


export function ChatProvider(props: { children: JSXElement }) {
	const chat = createSignal<ChatCreateResponseOutput | null>(null);


	return (
		<ChatContext.Provider
			value={{ chat
			}}
		>
			{props.children}
		</ChatContext.Provider>
	);
}

export function useChatContext() {
	const auth = useContext(ChatContext);

	if (!auth) throw Error("useAuth: cannot find AuthContext");

	return auth;
}
