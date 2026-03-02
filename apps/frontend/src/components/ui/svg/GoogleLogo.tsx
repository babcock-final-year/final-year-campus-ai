import clsx from "clsx/lite";
import logoSvg from "~/assets/google.svg?raw";

export default function GoogleLogo(props: { class?: string }) {
	return <div class={clsx("contents", props.class)} innerHTML={logoSvg} />;
}
