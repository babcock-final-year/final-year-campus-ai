import { Image } from "@kobalte/core/image";
import clsx from "clsx/lite";

interface ImageProps {
	class?: Partial<Record<"wrapper" | "fallback" | "img", string>>;
}

/** Dislays the user's profile picture when possible, falling back to a solid color display of their username intiials. */
export default function UserProfileImage(props: ImageProps) {
	return (
		<Image class={clsx("avatar", props.class?.wrapper)}>
			{/* TODO: Do actual user img fetching */}
			{/*<Image.Img class={clsx("", props.class?.img) }/>*/}

			{/* TODO: fetch the user's name and use their intials to build this */}
			<Image.Fallback
				class={clsx(
					"grid size-full place-items-center rounded-full bg-base-300",
					props.class?.fallback,
				)}
			>
				ME
			</Image.Fallback>
		</Image>
	);
}
