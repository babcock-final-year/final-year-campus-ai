import clsx from "clsx/lite";
import { Camera } from "lucide-solid";
import { createSignal, type JSXElement } from "solid-js";
import { uploadFile } from "~/server/file-upload";
import BaseButton from "./BaseButton";

interface UploadImageButtonProps {
	onUpload?: (uploadedUrl: string) => unknown;
	onStart?: () => unknown;
	onEnd?: (didUpload: boolean) => unknown;
	class?: string;
	children: JSXElement;
}

export default function UploadImageButton(props: UploadImageButtonProps) {
	const [isUploading, setIsUploading] = createSignal(false);

	let hiddenFileinput$!: HTMLInputElement;

	const onButtonClick = async () => {
		setIsUploading(true);
		await props.onStart?.();
		hiddenFileinput$.click();
	};

	const onFileInput = async ({ target }: { target: HTMLInputElement }) => {
		const file = target.files?.[0];

		if (!file) {
			setIsUploading(false);

			await props.onEnd?.(false);

			return;
		}

		const possibleUrl = await uploadFile(file);

		if (possibleUrl) await props.onUpload?.(possibleUrl);

		setIsUploading(false);

		await props.onEnd?.(true);
	};

	return (
		<BaseButton
			class={clsx("btn-primary", props.class)}
			disabled={isUploading()}
			onClick={onButtonClick}
		>
			{isUploading() ? (
				<span class="loading loading-spinner loading-sm" />
			) : (
				props.children
			)}
			<input
				accept="image/*"
				class="hidden"
				onCancel={() => {
					setIsUploading(false);
					props.onEnd?.(false);
				}}
				onInput={onFileInput}
				ref={hiddenFileinput$}
				type="file"
			/>
		</BaseButton>
	);
}
