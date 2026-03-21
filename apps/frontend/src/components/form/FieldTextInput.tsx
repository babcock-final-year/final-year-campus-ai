import type { FieldStore } from "@formisch/solid";
import { TextField } from "@kobalte/core/text-field";
import clsx from "clsx/lite";
import { type JSXElement, Show } from "solid-js";
import type { AnySchema } from "valibot";

interface FieldTextInputProps extends Omit<FieldStore<AnySchema>, "path"> {
	placeholder?: string;
	label: JSXElement;
	icon: JSXElement;
	type:
		| "text"
		| "email"
		| "tel"
		| "password"
		| "url"
		| "date"
		| "search"
		| "textarea";
	inputClass?: string;
}

export default function FieldTextInput(props: FieldTextInputProps) {
	return (
		<TextField
			class="flex flex-col"
			validationState={props.errors?.[0] ? "invalid" : "valid"}
		>
			<TextField.Label class="mb-2 font-semibold text-xs">
				{props.label}
			</TextField.Label>

			<Show
				fallback={
					<TextField.TextArea
						{...props.props}
						class={clsx("textarea validator grow", props.inputClass)}
						placeholder={props.placeholder || ""}
					/>
				}
				when={props.type !== "textarea"}
			>
				<div class={clsx("input validator", props.inputClass)}>
					{props.icon}
					<TextField.Input
						{...props.props}
						class="grow"
						placeholder={props.placeholder || ""}
						type={props.type}
					/>
				</div>
			</Show>

			<TextField.ErrorMessage class="validator-hint">
				{props.errors?.[0]}
			</TextField.ErrorMessage>
		</TextField>
	);
}
