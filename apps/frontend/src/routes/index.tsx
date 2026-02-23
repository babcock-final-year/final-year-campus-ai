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
import AppLogo from "~/components/svg/AppLogo";
import { routes } from "~/RouteManifest";

function ListWithIcon(props: { children: JSXElement; icon: JSXElement }) {
	return (
		<li class="grid grid-cols-[1.5rem_1fr] place-items-center gap-6">
			<div class="rounded-full bg-secondary p-2 text-primary-content shadow">
				{props.icon}
			</div>

			<div class="text-primary-content">{props.children}</div>
		</li>
	);
}

export default function Home() {
	return (
		<div class="hero size-full overflow-auto bg-linear-to-b from-sky-900 to-blue-950 p-8">
			<div class="hero-content flex-col gap-8 text-center sm:flex-row sm:gap-16">
				<AppLogo class="hidden *:h-auto *:w-2xs *:fill-primary-content sm:block" />

				<div>
					<AppLogo class="mx-auto block *:h-auto *:w-24 *:place-self-center *:fill-primary-content sm:hidden" />

					<h1 class="py-4 font-bold text-5xl text-primary-content">Unipal</h1>

					<p class="py-4 font-semibold text-primary-content">
						Your intelligent assistant for campus life.
					</p>

					<ul class="list-none space-y-4 py-4">
						<ListWithIcon icon={<MessagesSquareIcon />}>
							24/7 AI assistance for all your questions.
						</ListWithIcon>
						<ListWithIcon icon={<FileText />}>
							Accurate and verified responses.
						</ListWithIcon>
						<ListWithIcon icon={<CalendarDays />}>
							Stay organised with smart scheduling.
						</ListWithIcon>
					</ul>

					<div class="flex flex-col items-center justify-center gap-4 py-4">
						<Link
							as={A}
							class="btn btn-wide btn-lg [--btn-color:var(--color-primary-content)] [--btn-fg:var(--color-primary)]"
							href={routes().auth.signUp.index}
						>
							Get Started <UserRoundPlus />
						</Link>
						<Link
							as={A}
							class="btn btn-ghost btn-wide btn-lg text-primary-content hover:text-base-content"
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
