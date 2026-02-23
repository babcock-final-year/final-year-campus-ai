import { Button } from "@kobalte/core/button";
import clsx from "clsx/lite";
import type { ComponentProps } from "solid-js";

interface BaseButtonProps extends ComponentProps<"button"> {}

export default function BaseButton(props: BaseButtonProps) {
	return (
		<Button
			{...props}
			class={clsx("btn", props.class)}
			type={props.type ?? "button"}
		></Button>
	);
}
