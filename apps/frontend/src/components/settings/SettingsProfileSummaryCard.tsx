import { Link } from "@kobalte/core/link";
import clsx from "clsx/lite";
import { Camera, Dot } from "lucide-solid";
import { Suspense } from "solid-js";
import createUserProfile from "~/hooks/rpc/users/createUserProfile";
import { routes } from "~/RouteManifest";
import { revalidateUserData } from "~/rpc/revalidate-query";
import UsersRpc from "~/rpc/users";
import UploadImageButton from "../ui/button/UploadImageButton";
import UserProfileImage from "../ui/image/UserProfileImage";

export default function SettingsProfileSummaryCard(props: { class?: string }) {
	const userProfile = createUserProfile();

	return (
		<div
			class={clsx(
				"grid grid-cols-[6.5rem_1fr] grid-rows-[1fr_1.5rem_1.25fr] gap-x-2 overflow-auto rounded-box border border-base-300 bg-base-100 p-4 sm:grid-cols-[8rem_1fr]",
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
							const user = userProfile.latest;
							await UsersRpc.put(user.id, { avatar_url: url });
							await revalidateUserData();
						}}
					>
						<Camera />
					</UploadImageButton>
				}
			/>

			<h2 class="col-start-2 flex items-center truncate font-semibold text-xl md:text-2xl">
				<Suspense>{userProfile.latest.full_name}</Suspense>
			</h2>

			<p class="col-start-2 row-start-2 flex opacity-75">
				<Suspense>
					{userProfile.latest.username}
					<Dot /> {userProfile.latest.matric_no}
				</Suspense>
			</p>

			<div class="mt-1 flex size-full items-center">
				<Suspense>
					<Link
						class={clsx(
							"btn btn-primary btn-sm rounded-full",
							userProfile.latest.is_guest && "btn-disabled",
						)}
						disabled={!!userProfile.latest.is_guest}
						href={routes().home.editProfile.index}
					>
						Edit Profile
					</Link>
				</Suspense>
			</div>
		</div>
	);
}
