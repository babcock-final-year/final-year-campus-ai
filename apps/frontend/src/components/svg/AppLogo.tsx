import clsx from "clsx/lite";
import logoSvg from "~/assets/logo.svg?raw";

export default function AppLogo(props: { class?: string }) {
	return (
		<div
			class={clsx(
				"rounded-box p-2 shadow-inner backdrop-brightness-95",
				props.class,
			)}
			innerHTML={logoSvg}
		/>
	);
}
