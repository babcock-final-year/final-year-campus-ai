import clsx from "clsx/lite";
import { createSignal, type JSXElement, Suspense } from "solid-js";
import { useToastContext } from "~/context/ToastContextProvider";
import createUserProfile from "~/hooks/rpc/users/createUserProfile";
import { uploadFile } from "~/server/file-upload";
import BaseButton from "./BaseButton";

interface UploadImageButtonProps {
	onUpload?: (uploadedUrl: string) => unknown;
	onStart?: () => unknown;
	onEnd?: (didUpload: boolean) => unknown;
	class?: string;
	children: JSXElement;
	disabled?: boolean;
}

export default function UploadImageButton(props: UploadImageButtonProps) {
	const [isUploading, setIsUploading] = createSignal(false);

	const userProfile = createUserProfile();

	const toastContext = useToastContext();

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

		const formData = new FormData();
		formData.set("file", file);

		const possibleUrl = await uploadFile(formData);

		if (possibleUrl) {
			toastContext.showToast({
				title: "Image Upload Success",
				type: "success",
			});
			await props.onUpload?.(possibleUrl);
		} else
			toastContext.showToast({ title: "Image Upload Failed", type: "error" });

		setIsUploading(false);

		await props.onEnd?.(true);
	};

	return (
		<Suspense>
			<BaseButton
				class={clsx("btn-primary", props.class)}
				disabled={userProfile.latest.is_guest || isUploading()}
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
		</Suspense>
	);
}
