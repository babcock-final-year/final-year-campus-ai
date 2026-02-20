import clsx from "clsx/lite";
import logoSvg from "~/assets/logo.svg?raw";

export default function AppLogo(props: { class?: string }) {
	return <div class={clsx("contents", props.class)} innerHTML={logoSvg} />;
}
