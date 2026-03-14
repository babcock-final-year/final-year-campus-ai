import { Image } from "@kobalte/core/image";
import clsx from "clsx/lite";
import { createMemo, type JSXElement, Show } from "solid-js";
import createUserProfile from "~/hooks/user/createUserProfile";
import { getAccessToken } from "~/utils/auth-tokens";
import type { _ImageProps } from "./_shared";

interface UserProfileImageProps extends _ImageProps {
	avatarUrlOverride?: string | null;
	cornerBtn?: JSXElement;
}

/** Dislays the user's profile picture when possible, falling back to a solid color display of their name initials. */
export default function UserProfileImage(props: UserProfileImageProps) {
	const userProfile = createUserProfile();

	const initials = createMemo(() => {
		const fullName = userProfile().full_name.trim();
		if (!fullName) return "??";

		const parts = fullName.split(/\s+/).filter(Boolean);
		const first = parts.at(0)?.at(0) ?? "?";
		const second = parts.length > 1 ? parts.at(1)?.at(0) : parts.at(0)?.at(1);

		return `${first}${second ?? ""}`.toUpperCase();
	});

	const avatarUrl = createMemo(() => {
		const override = props.avatarUrlOverride?.trim() ?? null;
		if (override) return override;

		const url = userProfile().avatar_url ?? null;
		if (!url) return null;

		const token = getAccessToken();
		if (!token) return url;

		const buster = token.slice(-8);
		return url.includes("?") ? `${url}&v=${buster}` : `${url}?v=${buster}`;
	});

	return (
		<Image class={clsx("avatar", props.class?.wrapper)}>
			<Show fallback={null} when={avatarUrl()}>
				<Image.Img class={clsx("", props.class?.img)} src={avatarUrl() ?? ""} />
			</Show>

			<Image.Fallback
				class={clsx(
					"grid size-full place-items-center rounded-full bg-base-300",
					props.class?.fallback,
				)}
			>
				{initials()}
			</Image.Fallback>

			{props.cornerBtn}
		</Image>
	);
}
