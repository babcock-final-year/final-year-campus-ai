"use server";
import { Catbox } from "node-catbox";

const catbox = new Catbox();

export async function uploadFile(file: File): Promise<string | null> {
	try {
		return await catbox.uploadFileStream({
			filename: crypto.randomUUID(),
			stream: file.stream(),
		});
	} catch (e) {
		console.error("Could not upload file to catbox.moe because:", e);

		return null;
	}
}
