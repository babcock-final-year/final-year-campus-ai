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
				{(drawerProps) => (
					<>
						<Drawer.Trigger class="btn btn-ghost btn-circle btn-sm bg-base-200 sm:hidden">
							<Ellipsis class="stroke-primary" />
						</Drawer.Trigger>

						<Drawer.Portal>
							<Drawer.Overlay
								class="fixed inset-0 z-10 corvu-transitioning:transition-all corvu-transitioning:duration-500"
								style={{
									"backdrop-filter": `brightness(${100 - 25 * drawerProps.openPercentage}%)`,
								}}
							/>
							{/* The padding and negative left is to give clearance when the user drags on the drawer further rightwards, otherwise it'll look "cut-off" */}
							<Drawer.Content class="fixed inset-0 -left-12 z-10 flex w-fit bg-accent pl-12 corvu-transitioning:transition-transform corvu-transitioning:duration-500">
								<ChatSidebar isInDrawer={true} />
							</Drawer.Content>
						</Drawer.Portal>
					</>
				)}
			</Drawer>

			<div class="ml-auto flex items-center justify-center gap-2 rounded-field bg-base-200 px-2 py-4 [&_svg]:stroke-primary">
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
