"use server";
import { Catbox } from "node-catbox";
import { getServerEnv } from "~/utils/env";

const catbox = new Catbox();

export async function uploadFile(formData: FormData): Promise<string | null> {
	const file = formData.get("file");

	if (!(file instanceof File)) return null;

	try {
		const formData = new FormData();
		formData.append("image", file);

		const res = await fetch(
			`https://api.imgbb.com/1/upload?expiration=${60 * 24 * 30}&key=${getServerEnv().IMGBB_API_KEY}`,
			{
				body: formData,
				method: "POST",
			},
		);

		const json = await res.json();
		if (json.success) {
			console.log("Direct preview URL:", json.data.url);
			return json.data.url;
		} else {
			console.error(json.error);

			throw Error("ImgBB not successful");
		}
	} catch (e) {
		try {
			const url = await catbox.uploadFileStream({
				filename: file.name,
				stream: file.stream(),
			});

			return url;
		} catch {
			console.log("Catbox.moe not successful");
			return null;
		}
	}
}
