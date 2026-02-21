import type { FieldStore } from "@formisch/solid";
import { TextField } from "@kobalte/core/text-field";
import type { JSXElement } from "solid-js";
import type { AnySchema } from "valibot";

interface FieldTextInputProps extends Omit<FieldStore<AnySchema>, "path"> {
	placeholder?: string;
	label: JSXElement;
	icon: JSXElement;
	type: "text" | "email" | "tel" | "password" | "url" | "date" | "search";
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

			<div class="input validator">
				{props.icon}
				<TextField.Input
					{...props.props}
					class="grow"
					placeholder={props.placeholder || ""}
					type={props.type}
				/>
			</div>

			<TextField.ErrorMessage class="validator-hint">
				{props.errors?.[0]}
			</TextField.ErrorMessage>
		</TextField>
	);
}
