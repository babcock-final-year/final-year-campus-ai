import {
	createForm,
	Field,
	Form,
	type SubmitEventHandler,
} from "@formisch/solid";
import { Link } from "@kobalte/core/link";
import { A, useNavigate } from "@solidjs/router";
import {
	Calendar,
	GraduationCap,
	HatGlasses,
	LockKeyhole,
	type LucideIcon,
	MessageSquare,
	ShieldCheck,
	UserRoundPlus,
} from "lucide-solid";
import { createSignal } from "solid-js";
import FieldTextInput from "~/components/form/FieldTextInput";
import BaseButton from "~/components/ui/button/BaseButton";
import AppLogo from "~/components/ui/svg/AppLogo";
import GoogleLogo from "~/components/ui/svg/GoogleLogo";
import { SignInCredentialsSchema } from "~/models/credentials";
import { routes } from "~/RouteManifest";
import { guestLogin, login } from "~/server/auth";

function SignInForm() {
	const navigate = useNavigate();
	const [shouldRememberSignIn, setShouldRememberSignIn] = createSignal(false);

	const signInForm = createForm({
		initialInput: {
			pass: "",
			user: "",
		},
		schema: SignInCredentialsSchema,
	});

	const signInFormSubmitHandler: SubmitEventHandler<
		typeof SignInCredentialsSchema
	> = async (signInInfo, _ev) => {
		const res = await login({
			email: signInInfo.user,
			password: signInInfo.pass,
		});

		if (!res.ok) return;

		navigate(routes().home.chat.index);
	};

	const handleGuestLogin = async () => {
		const res = await guestLogin();

		if (!res.ok) return;

		navigate(routes().home.chat.index);
	};

	return (
		<Form
			class="flex w-96 max-w-9/10 flex-col gap-6 rounded-box bg-base-100 px-4 py-8 shadow sm:px-8"
			of={signInForm}
			onSubmit={signInFormSubmitHandler}
		>
			<div class="mb-4 flex flex-col items-center justify-center gap-4">
				<AppLogo class="*:h-auto *:w-12" />

				<div class="space-y-1 text-center">
					<h2 class="font-bold text-xl">Welcome back!</h2>

					<p class="text-xs opacity-75">Sign in to continue with Unipal</p>
				</div>
			</div>

			<Field of={signInForm} path={["user"]}>
				{(field) => (
					<FieldTextInput
						{...field}
						icon={<UserRoundPlus class="opacity-50" />}
						inputClass="bg-base-200"
						label="Username / Email"
						placeholder="your-email@domain.com"
						type="text"
					/>
				)}
			</Field>

			<Field of={signInForm} path={["pass"]}>
				{(field) => (
					<FieldTextInput
						{...field}
						icon={<LockKeyhole class="opacity-50" />}
						inputClass="bg-base-200"
						label="Password"
						placeholder="Enter your password"
						type="password"
					/>
				)}
			</Field>

			<div class="flex items-center justify-between text-xs">
				<label class="flex items-center justify-between gap-2">
					<input
						checked={shouldRememberSignIn()}
						class="checkbox checkbox-xs bg-base-200"
						id="remember-me-checkbox"
						onInput={(e) => setShouldRememberSignIn(e.target.checked)}
						type="checkbox"
					/>
					Remember me
				</label>

				<A
					class="link link-primary ml-auto text-xs"
					href={routes().auth.signIn.forgotPassword.index}
				>
					Forgot Password?
				</A>
			</div>

			<BaseButton class="btn-primary mx-auto w-full" type="submit">
				Sign In
			</BaseButton>

			<div class="divider m-0 text-xs opacity-50">Or continue with</div>

			<div class="*:btn-secondary flex gap-4 *:grow">
				<BaseButton>
					<GoogleLogo /> Google
				</BaseButton>

				<BaseButton class="btn" onClick={handleGuestLogin} type="button">
					<HatGlasses /> Guest
				</BaseButton>
			</div>

			<p class="mx-auto text-xs">
				Don't have an account?{" "}
				<A class="link link-primary" href={routes().auth.signUp.index}>
					Sign Up
				</A>
			</p>
		</Form>
	);
}

function HeroContentCard(props: {
	title: string;
	icon: LucideIcon;
	children: string;
}) {
	return (
		<div class="flex aspect-10/9 w-56 flex-col gap-4 rounded-box border border-base-300 bg-base-100 p-4">
			<div class="size-fit rounded-lg bg-base-300 p-2">
				<props.icon class="stroke-primary" />
			</div>

			<h3 class="font-semibold">{props.title}</h3>

			<p class="text-sm opacity-75">{props.children}</p>
		</div>
	);
}

function HeroContent() {
	return (
		<div class="hidden h-full flex-col justify-around md:flex">
			<div class="flex flex-col justify-center gap-4">
				<div class="size-fit rounded-lg bg-base-300 p-2">
					<GraduationCap class="size-8 stroke-primary" />
				</div>
				<h1 class="font-bold text-5xl">Unipal</h1>
				<p class="opacity-75">Your intelligent assistant for campus life</p>
			</div>

			<div class="flex gap-4">
				<HeroContentCard icon={MessageSquare} title="24/7 Assistance">
					AI assistance for all your campus questions anytime.
				</HeroContentCard>

				<HeroContentCard icon={ShieldCheck} title="Accurate & Verifed">
					Responses are cross-referenced with official campus data.
				</HeroContentCard>

				<HeroContentCard icon={Calendar} title="Smart Scheduling">
					Stay organised with integrted scheduling tools.
				</HeroContentCard>
			</div>
		</div>
	);
}

export default function SignInPage() {
	return (
		<div class="items-center-safe flex size-full justify-around gap-8 overflow-y-auto bg-base-200 p-4">
			<HeroContent />

			<SignInForm />
		</div>
	);
}
