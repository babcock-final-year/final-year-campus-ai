// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

export default function ClientEntry() {
	return <StartClient />;
}

mount(() => <ClientEntry />, document.getElementById("app")!);
