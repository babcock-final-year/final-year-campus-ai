import Drawer from "corvu/drawer";
import {
	Ellipsis,
	MessageCirclePlus,
	SquarePen,
	UserRound,
} from "lucide-solid";
import BaseButton from "../button/BaseButton";
import ChatSidebar from "./ChatSidebar";

export default function ChatMainAreaHeader() {
	return (
		<div class="flex justify-between">
			<Drawer breakPoints={[0.75]} side="left">
				<Drawer.Trigger class="btn btn-ghost btn-circle btn-sm bg-base-200">
					<Ellipsis class="stroke-primary" />
				</Drawer.Trigger>

				<Drawer.Portal>
					<Drawer.Overlay class="fixed inset-0 z-50 data-transitioning:transition-colors data-transitioning:duration-500" />
					<Drawer.Content class="fixed inset-x-0 bottom-0 z-50 data-transitioning:transition-transform data-transitioning:duration-500">
						<ChatSidebar />
					</Drawer.Content>
				</Drawer.Portal>
			</Drawer>

			<div class="flex items-center justify-center gap-2 rounded-field bg-base-200 px-2 py-4 [&_svg]:stroke-primary">
				<BaseButton class="btn-ghost btn-circle btn-sm">
					<MessageCirclePlus />
				</BaseButton>
				<BaseButton class="btn-ghost btn-circle btn-sm">
					<SquarePen />
				</BaseButton>
				<BaseButton class="btn-ghost btn-circle btn-sm">
					<UserRound />
				</BaseButton>
			</div>
		</div>
	);
}
