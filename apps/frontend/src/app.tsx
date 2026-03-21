import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { AuthProvider } from "./context/AuthContextProvider";
import { ChatProvider } from "./context/ChatContextProvider";
import { ToastProvider } from "./context/ToastContextProvider";

export default function App() {
	return (
		<AuthProvider>
			<ChatProvider>
				<ToastProvider>
					<Router
						root={(props) => (
							<div class="flex h-screen w-screen items-center justify-center overflow-clip">
								<Suspense>{props.children}</Suspense>
							</div>
						)}
					>
						<FileRoutes />
					</Router>
				</ToastProvider>
			</ChatProvider>
		</AuthProvider>
	);
}
