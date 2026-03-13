import { Link } from "@kobalte/core/link";
import clsx from "clsx/lite";
import { Camera, Dot } from "lucide-solid";
import createUserProfile from "~/hooks/user/createUserProfile";
import { routes } from "~/RouteManifest";
import UploadImageButton from "../ui/button/UploadImageButton";
import UserProfileImage from "../ui/image/UserProfileImage";

export default function SettingsProfileSummaryCard(props: { class?: string }) {
	const userProfile = createUserProfile();

	const initials = () => {
		const fullName = userProfile().full_name.trim();
		if (!fullName) return "?";

		const parts = fullName.split(/\s+/).filter(Boolean);
		const first = parts.at(0)?.at(0) ?? "?";
		const second = parts.length > 1 ? parts.at(1)?.at(0) : parts.at(0)?.at(1);

		return `${first}${second ?? ""}`.toUpperCase();
	};

	return (
		<div
			class={clsx(
				"grid grid-cols-[8rem_1fr] grid-rows-[1fr_1.5rem_1.25fr] gap-x-2 rounded-box border border-base-300 bg-base-100 p-4",
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
					<UploadImageButton class="btn-circle btn-sm absolute -right-1 -bottom-1 p-1.5">
						<Camera />
					</UploadImageButton>
				}
			/>

			<h2 class="col-start-2 flex items-center truncate font-semibold text-xl md:text-2xl">
				{userProfile().full_name}
			</h2>

			<p class="col-start-2 row-start-2 flex opacity-75">
				{initials()} <Dot /> {userProfile().matric_no ?? "—"}
			</p>

			<div class="mt-1 flex size-full items-center">
				<Link
					class="btn btn-primary btn-sm rounded-full"
					href={routes().home.editProfile.index}
				>
					Edit Profile
				</Link>
			</div>
		</div>
	);
}
