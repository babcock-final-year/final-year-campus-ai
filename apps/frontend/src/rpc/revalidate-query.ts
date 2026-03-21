import { revalidate } from "@solidjs/router";
import AuthRpc from "./auth";
import ChatRpc from "./chat";
import ComplaintRpc from "./complaint";
import HistoryRpc from "./history";
import UsersRpc from "./users";

/**
 * Revalidate all RPC GET queries in one place.
 *
 * Use this instead of calling `revalidate([...])` manually across the codebase.
 * This centralises which RPC GET keys should be refreshed after user actions
 * that may affect multiple cached queries (e.g. profile update, logout, etc.).
 */
export async function revalidateUserData(): Promise<void> {
	await revalidate([
		AuthRpc.me.get.key,

		UsersRpc.get.key,
	]);
}

export async function revalidateChatData(): Promise<void> {
	await revalidate([ChatRpc.get.key, HistoryRpc.chats.get.key]);
}

export async function revalidateComplaintData(): Promise<void> {
	await revalidate([ComplaintRpc.get.key, ComplaintRpc.byId.get.key]);
}
