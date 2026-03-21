import type { JSXElement } from "solid-js";
import HomeSidebar from "~/components/home/HomeSidebar";

export default function ChatLayout(props: { children: JSXElement }) {
	return (
		<div class="flex size-full">
			<div class="hidden h-full w-fit bg-accent sm:block">
				<HomeSidebar />
			</div>
			{props.children}
		</div>
	);
}
