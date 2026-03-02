import clsx from "clsx/lite";
import { Camera, Dot } from "lucide-solid";
import BaseButton from "../ui/button/BaseButton";
import UserProfileImage from "../ui/image/UserProfileImage";

export default function SettingsProfileSummaryCard(props: { class?: string }) {
	return (
		<div
			class={clsx(
				"grid grid-cols-[8rem_1fr] grid-rows-[1.5fr_1fr] gap-x-2 rounded-box border border-base-300 bg-base-100 p-4",
				props.class,
			)}
		>
			<UserProfileImage
				class={{
					fallback: "text-3xl",
					wrapper:
						"row-span-3 aspect-square h-5/6 max-h-[25vw] place-self-center rounded-full shadow-lg outline-3 outline-base-100",
				}}
				cornerBtn={
					<BaseButton class="btn-primary btn-circle btn-sm absolute -right-1 -bottom-1 p-1.5">
						<Camera />
					</BaseButton>
				}
			/>

			{/* TODO: Get user name */}
			<h2 class="col-start-2 flex items-center font-semibold text-xl md:text-2xl">
				Phenomenan 69420
			</h2>

			{/* TODO: Initials and matric no */}
			<p class="col-start-2 row-start-2 flex font-mono opacity-75">
				P_6 <Dot /> 22/1224
			</p>
		</div>
	);
}
