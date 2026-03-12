import { createAsync } from "@solidjs/router";

// TODO
export default function createContactEmail() {
	const contactEmail = createAsync(async () => "jessemokolo@gmail.com", {
		initialValue: "jessemokolo@gmail.com",
	});

	return contactEmail;
}
