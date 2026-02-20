import clsx from "clsx/lite";
import type { ComponentProps } from "solid-js";

interface BaseButtonProps extends ComponentProps<"button"> {}

export default function BaseButton(props: BaseButtonProps) {
	return (
		<button
			{...props}
			class={clsx("btn", props.class)}
			type={props.type ?? "button"}
		></button>
	);
}
