import { createContext, createSignal, type Signal } from "solid-js";

interface ShowToastProps {
	title: string;
	description?: string;
	class?: {
		/** Alert class like `alert-error` */
		alert?: string;
		closeBtn?: string;
	};
}

interface ToastContextData {
	showToast(props: ShowToastProps): void;
}

export const ToastContext = createContext<ToastContextData>();
