import { Link } from "@kobalte/core/link";
import { HatGlasses } from "lucide-solid";
import { routes } from "~/RouteManifest";

export default function GuestLoginButton() {
	return (
		<Link class="btn" href={routes().home.chat.index}>
			<HatGlasses /> Guest
		</Link>
	);
}
