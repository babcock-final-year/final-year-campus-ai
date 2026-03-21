import { Link } from "@kobalte/core/link";
import { revalidate } from "@solidjs/router";
import clsx from "clsx/lite";
import { Camera, Dot } from "lucide-solid";
import createUserProfile from "~/hooks/rpc/users/createUserProfile";
import { routes } from "~/RouteManifest";
import UsersRpc from "~/rpc/users";
import { getCapitalizedWordInitials } from "~/utils/string";
import UploadImageButton from "../ui/button/UploadImageButton";
import UserProfileImage from "../ui/image/UserProfileImage";

export default function SettingsProfileSummaryCard(props: { class?: string }) {
	const userProfile = createUserProfile();

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
					<UploadImageButton
						class="btn-circle btn-sm absolute -right-1 -bottom-1 p-1.5"
						onUpload={async (url: string) => {
							const user = userProfile();
							if (!user?.id) return;
							await UsersRpc.put(user.id, { avatar_url: url });
							await revalidate(UsersRpc.get.key);
						}}
					>
						<Camera />
					</UploadImageButton>
				}
			/>

			<h2 class="col-start-2 flex items-center truncate font-semibold text-xl md:text-2xl">
				{userProfile().full_name}
			</h2>

			<p class="col-start-2 row-start-2 flex opacity-75">
				{userProfile().username}
				<Dot /> {userProfile().matric_no}
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
