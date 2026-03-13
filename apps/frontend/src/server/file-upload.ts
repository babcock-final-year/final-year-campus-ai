"use server";

import { SERVER_ENV } from "~/constants/env";

export async function uploadFile(formData: FormData): Promise<string | null> {
	const file = formData.get("file");

	if (!(file instanceof File)) return null;

	try {
		const formData = new FormData();
		formData.append("image", file);

		const res = await fetch(
			`https://api.imgbb.com/1/upload?expiration=${60 * 24 * 30}&key=${SERVER_ENV.IMGBB_API_KEY}`,
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

			return null;
		}
	} catch (e) {
		console.error("Could not upload file to catbox.moe because:", e);

		return null;
	}
}
