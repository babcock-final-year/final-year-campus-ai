import * as v from "valibot";
import { ChatHistoryResponseSchema } from "./chat.schemas";

/**
 * Schema for a single chat summary in the user's history list.
 */
export const ChatSummarySchema = v.object({
	created_at: v.pipe(v.string(), v.toDate()),
	id: v.pipe(v.unknown(), v.toString()),
	title: v.string(),
});
export type ChatSummaryInput = v.InferInput<typeof ChatSummarySchema>;
export type ChatSummaryOutput = v.InferOutput<typeof ChatSummarySchema>;

/**
 * Schema for the response of GET /history/chats
 * Returns a list of all chats for the current user.
 */
export const ChatsListResponseSchema = v.object({
	chats: v.array(ChatSummarySchema),
});
export type ChatsListResponseInput = v.InferInput<
	typeof ChatsListResponseSchema
>;
export type ChatsListResponseOutput = v.InferOutput<
	typeof ChatsListResponseSchema
>;

/**
 * Optionally, if the backend returns full chat history objects in the list,
 * you can use ChatHistoryResponseSchema[] instead of ChatSummarySchema[].
 * Uncomment and adjust as needed:
 */
// export const ChatsListResponseSchema = v.object({
//   chats: v.array(ChatHistoryResponseSchema),
// })
// export type ChatsListResponseInput = v.InferInput<typeof ChatsListResponseSchema>;
// export type ChatsListResponseOutput = v.InferOutput<typeof ChatsListResponseSchema>;
