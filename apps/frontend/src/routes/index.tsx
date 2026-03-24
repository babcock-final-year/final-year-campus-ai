import { Link } from "@kobalte/core/link";
import { A } from "@solidjs/router";
import {
	CalendarDays,
	FileText,
	LogIn,
	MessagesSquareIcon,
	UserRoundPlus,
} from "lucide-solid";
import type { JSXElement } from "solid-js";
import AppLogo from "~/components/ui/svg/AppLogo";
import { routes } from "~/RouteManifest";

function ListWithIcon(props: { children: JSXElement; icon: JSXElement }) {
	return (
		<li class="grid grid-cols-[1.5rem_1fr] place-items-center gap-6">
			<div class="rounded-full bg-base-100 p-2 shadow">{props.icon}</div>

			<div class="text-secondary">{props.children}</div>
		</li>
	);
}

export default function Home() {
	return (
		<div class="hero size-full overflow-auto bg-linear-to-bl from-primary/90 to-accent p-8">
			<div class="hero-content flex-col gap-8 text-center sm:flex-row sm:gap-16">
				<div class="fixed top-6">
					<AppLogo class="mx-auto block *:h-auto *:w-10 *:place-self-center *:fill-secondary" />
					<span class="inline-flex gap-1 text-secondary/75 text-xs">
						<p>U</p>
						<p>N</p>
						<p>I</p>
						<p>P</p>
						<p>A</p>
						<p>L</p>
					</span>
				</div>

				<div class="flex max-w-[80vw] flex-col items-center gap-2 sm:max-w-3xl">
					<h1 class="py-4 font-bold text-3xl text-secondary sm:text-5xl">
						<span class="text-blue-300">Unipal:</span> Your Conversational
						Assistant for Student Services
					</h1>

					<p class="max-w-4/5 py-4 text-secondary/75 sm:max-w-3/5">
						Simplifying your academic journey with instant answers, and smart
						campus resources.
					</p>

					<div class="flex flex-col items-center justify-center gap-4 py-4 sm:flex-row">
						<Link
							class="btn btn-lg btn-secondary"
							href={routes().auth.signUp.index}
						>
							Get Started <UserRoundPlus />
						</Link>
						<Link
							class="btn btn-ghost btn-lg btn-primary not-hover:text-secondary"
							href={routes().auth.signIn.index}
						>
							Sign In <LogIn />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
