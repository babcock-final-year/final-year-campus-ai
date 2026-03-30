import { A, useNavigate } from "@solidjs/router";
import { Check } from "lucide-solid";
import { onCleanup, onMount } from "solid-js";
import { routes } from "~/RouteManifest";

// Tell the user to
export default function SignUpSuccessPage() {
	const navigate = useNavigate();

	onMount(() => {
		const timeoutId = setTimeout(
			() => navigate(routes().auth.signIn.index),
			1000 * 30,
		);

		onCleanup(() => clearTimeout(timeoutId));
	});

	return (
		<main class="grid h-8/10 w-full grid-rows-3 place-items-center gap-8 p-4">
			<h1 class="font-bold text-2xl">Sign up sucessful!</h1>

			<div class="motion-safe:motion-scale-in-75 grid size-36 place-items-center rounded-full bg-primary/50 shadow-lg shadow-primary/50 md:size-44">
				<div class="grid size-8/10 place-items-center rounded-full bg-primary">
					<Check class="size-6/10 text-base-100" strokeWidth={4} />
				</div>
			</div>

			<div class="flex flex-col items-center justify-center gap-2 text-center">
				<p>
					Your account has been sucessfully created. Check your email for the
					verification link.
				</p>

				<p>
					If you're already verified, click this{" "}
					<A
						class="link link-primary text-lg"
						href={routes().auth.signIn.index}
					>
						link
					</A>{" "}
					to login.
				</p>
			</div>
		</main>
	);
}
