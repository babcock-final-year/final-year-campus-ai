import type { ComponentProps } from "solid-js";

interface BaseButtonProps extends ComponentProps<"button"> {}

export default function BaseButton(props: BaseButtonProps) {
	return <button {...props} type={props.type ?? "button"}></button>;
}
