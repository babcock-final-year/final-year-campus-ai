import { Image } from "@kobalte/core/image";
import clsx from "clsx/lite";
import { type JSXElement, Show } from "solid-js";
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
			<Show when={userProfile().avatar_url}>
				{(url) => <Image.Img class={clsx("", props.class?.img)} src={url()} />}
			</Show>

			{/* TODO: fetch the user's name and use their intials to build this */}
			<Image.Fallback
				class={clsx(
					"grid size-full place-items-center rounded-full bg-base-300",
					props.class?.fallback,
				)}
			>
				{getCapitalizedWordInitials(userProfile().full_name)}
			</Image.Fallback>

			{props.cornerBtn}
		</Image>
	);
}
