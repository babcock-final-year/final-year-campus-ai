import {
	createForm,
	Field,
	Form,
	type SubmitEventHandler,
} from "@formisch/solid";
import { Link } from "@kobalte/core/link";
import { A } from "@solidjs/router";
import { ArrowLeft, ArrowRight, Mail } from "lucide-solid";
import { createSignal, Show } from "solid-js";
import FieldTextInput from "~/components/form/FieldTextInput";
import BaseButton from "~/components/ui/button/BaseButton";
import AppLogo from "~/components/ui/svg/AppLogo";
import { SendPasswordResetLinkSchema } from "~/models/credentials";
import { routes } from "~/RouteManifest";
import { requestPasswordReset } from "~/server/auth";

function PasswordResetForm() {
	const passwordResetForm = createForm({
		initialInput: { email: "" },
		schema: SendPasswordResetLinkSchema,
	});

	const [isSubmitting, setIsSubmitting] = createSignal(false);
	const [status, setStatus] = createSignal<
		| { type: "idle" }
		| { type: "success"; message: string }
		| { type: "error"; message: string }
	>({ type: "idle" });

	const passwordResetFormSubmitHandler: SubmitEventHandler<
		typeof SendPasswordResetLinkSchema
	> = async (passwordResetInfo) => {
		if (isSubmitting()) return;

		setIsSubmitting(true);
		setStatus({ type: "idle" });

		try {
			const res = await requestPasswordReset({
				email: passwordResetInfo.email.trim(),
			});

			if (!res.ok) {
				setStatus({
					message: res.message,
					type: "error",
				});
				return;
			}

			setStatus({
				message: res.message,
				type: "success",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form
			class="flex w-xs max-w-9/10 flex-col gap-6 p-4"
			of={passwordResetForm}
			onSubmit={passwordResetFormSubmitHandler}
		>
			<div class="flex flex-col justify-center gap-1">
				<h1 class="font-bold text-xl">Forgot Password</h1>

				<p class="text-sm opacity-75">No worries, we'll help you reset it.</p>
			</div>

			<Field of={passwordResetForm} path={["email"]}>
				{(field) => (
					<FieldTextInput
						{...field}
						icon={<Mail class="opacity-50" />}
						label="Email Address"
						placeholder="johnmicheal@gmail.com"
						type="email"
					/>
				)}
			</Field>

			<BaseButton
				class="btn-primary mx-auto w-full"
				disabled={isSubmitting()}
				type="submit"
			>
				Send Reset Link <ArrowRight />
			</BaseButton>

			<Show when={status().type === "success"}>
				<p class="text-sm text-success">
					{(status() as { type: "success"; message: string }).message}
				</p>
			</Show>

			<Show when={status().type === "error"}>
				<p class="text-error text-sm">
					{(status() as { type: "error"; message: string }).message}
				</p>
			</Show>

			<div class="divider m-0 opacity-50" />

			<Link
				class="btn btn-ghost mx-auto w-full"
				href={routes().auth.signIn.index}
			>
				<ArrowLeft /> Back to Login
			</Link>
		</Form>
	);
}

function HeroContent() {
	return (
		<div class="hidden h-[stretch] w-1/2 bg-linear-to-br from-primary via-5% to-accent p-4 md:block">
			{/* Wrapper to prevent layout shift to the hero content when the form overflows */}
			<div class="flex h-screen w-full flex-col items-center justify-center gap-4 *:text-center *:text-primary-content">
				<AppLogo class="*:size-16 *:fill-primary-content" />

				<h1 class="font-bold text-5xl">Unipal</h1>

				<p class="max-w-96 opacity-75">Need a hand? We've got you covered.</p>
			</div>
		</div>
	);
}

export default function PasswordResetPage() {
	return (
		<div class="size-full overflow-y-auto bg-base-200">
			{/* Wrapper so the hero content's background doesn't get "cut" when the form overflows */}
			<div class="items-center-safe flex size-full min-h-fit">
				<HeroContent />

				<div class="items-center-safe justify-center-safe flex w-screen p-4 md:w-1/2">
					<PasswordResetForm />
				</div>
			</div>
		</div>
	);
}
