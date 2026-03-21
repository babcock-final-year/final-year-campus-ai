import { createContext, type Signal } from "solid-js";

interface ShowToastProps {
	title: string;
	description?: string;
	type: "success" | "error";
}

interface ToastContextData {
	showToast(props: ShowToastProps): void;
}

export const ToastContext = createContext<ToastContextData>();
