import { Toast, toaster } from "@kobalte/core/toast";
import clsx from "clsx/lite";
import { X } from "lucide-solid";
import { type JSXElement, useContext } from "solid-js";
import { ToastContext } from "./ToastContext";

export function ToastProvider(props: { children: JSXElement }) {
	return (
		<ToastContext.Provider
			value={{
				showToast({ title, type, description }) {
					const isError = type === "error";
					const isSuccess = type === "success";

					toaster.show((props) => (
						<Toast
							class={clsx(
								"alert flex",
								isError && "alert-error",
								isSuccess && "alert-success",
							)}
							toastId={props.toastId}
						>
							<div class="flex w-full items-center justify-between gap-4">
								<div>
									<Toast.Title class="font-semibold">{title}</Toast.Title>
									{description && (
										<Toast.Description class="text-sm opacity-90">
											{description}
										</Toast.Description>
									)}
								</div>
								<Toast.CloseButton
									class={clsx(
										"btn btn-circle btn-sm",
										isError && "btn-error",
										isSuccess && "btn-success",
									)}
								>
									<X />
								</Toast.CloseButton>
							</div>
						</Toast>
					));
				},
			}}
		>
			<Toast.Region duration={3000}>
				<Toast.List class="toast toast-top toast-end [data-swipe=move]:translate-x-(--kb-toast-swipe-move-x)" />
			</Toast.Region>
			{props.children}
		</ToastContext.Provider>
	);
}

export function useToastContext() {
	const toast = useContext(ToastContext);

	if (!toast) throw Error("useToast: cannot find ToastContext");

	return toast;
}
