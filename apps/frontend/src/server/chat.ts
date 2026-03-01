"use server";

import type { ChatHistoryResponse } from "@packages/shared-types";

export async function getUserChatHistory(): Promise<ChatHistoryResponse | null> {
	// Dummy data
	return {
		chat_id: "",
		messages: [
			{
				content: "Hello Friend :D",
				id: Math.random() * 10000,
				role: "user",
				timestamp: new Date().toISOString(),
			},
			{
				content:
					"Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet ",
				id: Math.random() * 10000,
				role: "assistant",
				timestamp: new Date().toISOString(),
			},
			{
				content: "Hello Friend :D",
				id: Math.random() * 10000,
				role: "user",
				timestamp: new Date().toISOString(),
			},
			{
				content:
					"Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet ",
				id: Math.random() * 10000,
				role: "assistant",
				timestamp: new Date().toISOString(),
			},
			{
				content: "Hello Friend :D",
				id: Math.random() * 10000,
				role: "user",
				timestamp: new Date().toISOString(),
			},
			{
				content:
					"Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet ",
				id: Math.random() * 10000,
				role: "assistant",
				timestamp: new Date().toISOString(),
			},
			{
				content: "Hello Friend :D",
				id: Math.random() * 10000,
				role: "user",
				timestamp: new Date().toISOString(),
			},
			{
				content:
					"Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet ",
				id: Math.random() * 10000,
				role: "assistant",
				timestamp: new Date().toISOString(),
			},
			{
				content: "Hello Friend :D",
				id: Math.random() * 10000,
				role: "user",
				timestamp: new Date().toISOString(),
			},
			{
				content:
					"Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet ",
				id: Math.random() * 10000,
				role: "assistant",
				timestamp: new Date().toISOString(),
			},
			{
				content: "Hello Friend :D",
				id: Math.random() * 10000,
				role: "user",
				timestamp: new Date().toISOString(),
			},
			{
				content:
					"Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet ",
				id: Math.random() * 10000,
				role: "assistant",
				timestamp: new Date().toISOString(),
			},
			{
				content: "Hello Friend :D",
				id: Math.random() * 10000,
				role: "user",
				timestamp: new Date().toISOString(),
			},
			{
				content:
					"Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet ",
				id: Math.random() * 10000,
				role: "assistant",
				timestamp: new Date().toISOString(),
			},
			{
				content: "Hello Friend :D",
				id: Math.random() * 10000,
				role: "user",
				timestamp: new Date().toISOString(),
			},
			{
				content:
					"Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet Lorem Ipsum Dolomet ",
				id: Math.random() * 10000,
				role: "assistant",
				timestamp: new Date().toISOString(),
			},
		],
		title: "Test",
	};
}
