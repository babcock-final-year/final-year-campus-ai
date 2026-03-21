import { A, useNavigate } from "@solidjs/router";
import { Check } from "lucide-solid";
import { routes } from "~/RouteManifest";

// Tell the user to
export default function SignUpSuccessPage() {
	const navigate = useNavigate();

	return (
		<main class="grid h-9/10 w-full grid-rows-3 place-items-center gap-8 p-4">
			<h1 class="font-bold text-2xl">Sign up sucessful!</h1>

			<div class="grid size-36 place-items-center rounded-full bg-primary/50 shadow-lg shadow-primary/50 md:size-44">
				<div class="grid size-8/10 place-items-center rounded-full bg-primary">
					<Check class="size-6/10 text-base-100" strokeWidth={4} />
				</div>
			</div>

			<div class="flex flex-col items-center justify-center gap-2 text-center text-sm">
				<p>
					Your account has been sucessfully created. Check your email for the
					verification link.
				</p>

				<p>
					If you're already verified, click this{" "}
					<A class="link link-primary" href={routes().auth.signIn.index}>
						link
					</A>{" "}
					.
				</p>
			</div>
		</main>
	);
}
