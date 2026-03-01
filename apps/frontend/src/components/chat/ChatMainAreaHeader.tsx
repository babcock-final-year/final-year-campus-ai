import Drawer from "corvu/drawer";
import { PanelLeftOpen } from "lucide-solid";
import ChatSidebar from "./ChatSidebar";

export default function ChatMainAreaHeader() {
	return (
		<div class="flex items-center justify-between border-base-300 border-b bg-base-100 p-4">
			<Drawer breakPoints={[0.75]} side="left">
				{(drawerProps) => (
					<>
						<Drawer.Trigger class="btn btn-secondary btn-circle sm:hidden">
							<PanelLeftOpen />
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
		</div>
	);
}
