import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { AuthProvider } from "./context/AuthContextProvider";

export default function App() {
	return (
		<Router
			root={(props) => (
				<div class="flex h-screen w-screen items-center justify-center overflow-clip">
					<AuthProvider>
						<Suspense>{props.children}</Suspense>
					</AuthProvider>
				</div>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
