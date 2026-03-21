import { Image } from "@kobalte/core/image";
import clsx from "clsx/lite";
import { type JSXElement, Show, Suspense } from "solid-js";
import createUserProfile from "~/hooks/rpc/users/createUserProfile";
import { getCapitalizedWordInitials } from "~/utils/string";
import type { _ImageProps } from "./_shared";

interface UserProfileImageProps extends _ImageProps {
	cornerBtn?: JSXElement;
}

/** Dislays the user's profile picture when possible, falling back to a solid color display of their username intiials. */
export default function UserProfileImage(props: UserProfileImageProps) {
	const userProfile = createUserProfile();

	return (
		<Image class={clsx("avatar", props.class?.wrapper)}>
			<Suspense>
				<Show when={userProfile.latest.avatar_url}>
					{(url) => (
						<Image.Img
							class={clsx("rounded-full", props.class?.img)}
							src={url()}
						/>
					)}
				</Show>
			</Suspense>

			<Image.Fallback
				class={clsx(
					"grid size-full place-items-center rounded-full bg-base-300",
					props.class?.fallback,
				)}
			>
				<Suspense fallback="FO">
					{getCapitalizedWordInitials(userProfile.latest.full_name)}
				</Suspense>
			</Image.Fallback>

			{props.cornerBtn}
		</Image>
	);
}
