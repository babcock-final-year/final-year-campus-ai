import { createContext, createSignal, type Signal } from "solid-js";
import type { ChatCreateResponseOutput } from "~/models/chat.schemas";

interface ChatContextData {
	chat: Signal<ChatCreateResponseOutput | null>;
}

export const ChatContext = createContext<ChatContextData>({
	chat: createSignal<ChatCreateResponseOutput | null>(null),
});
