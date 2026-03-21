import {  createContext,   createSignal,   Signal } from "solid-js";
import { ChatCreateResponseOutput } from "~/models/chat.schemas";

interface ChatContextData {
  chat: Signal<ChatCreateResponseOutput | null>,
}

export const ChatContext = createContext<ChatContextData>({
  chat: createSignal<ChatCreateResponseOutput|null>(null)
});
