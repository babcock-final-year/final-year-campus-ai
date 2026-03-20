import {
	createForm,
	Field,
	Form,
	type SubmitEventHandler,
} from "@formisch/solid";
import { Link } from "@kobalte/core/link";
import { A, useNavigate } from "@solidjs/router";
import {
	HatGlasses,
	LockKeyhole,
	Mail,
	RotateCcwKey,
	UserRoundPlus,
} from "lucide-solid";
import { createSignal } from "solid-js";
import FieldTextInput from "~/components/form/FieldTextInput";
import BaseButton from "~/components/ui/button/BaseButton";
import GuestLoginButton from "~/components/ui/button/GuestLoginButton";
import AppLogo from "~/components/ui/svg/AppLogo";
import GoogleLogo from "~/components/ui/svg/GoogleLogo";
import { useAuth } from "~/context/AuthContextProvider";
import { SignUpCredentialsSchema } from "~/models/credentials";
import { routes } from "~/RouteManifest";
import AuthRpc from "~/rpc/auth";

function SignUpForm() {
	const [hasAcceptedTerms, setHasAcceptedTerms] = createSignal(false);
	const [isRegistering, setIsRegistering] = createSignal(false);

	const authContext = useAuth();
	const navigate = useNavigate();

	const signUpForm = createForm({
		initialInput: { confirmPass: "", email: "", pass: "", username: "" },
		schema: SignUpCredentialsSchema,
	});

	const signUpFormSubmitHandler: SubmitEventHandler<
		typeof SignUpCredentialsSchema
	> = async ({ email, pass, username }, _ev) => {
		setIsRegistering(true);

		const res = await AuthRpc.register.post({
			email,
			full_name: username,
			password: pass,
		});

		// TODO: add error toast
		if (!res.success) {
			setIsRegistering(false);

			return;
		}

		const { access_token, refresh_token, user } = res.res;

		authContext?.setAccessToken(access_token);
		authContext?.setUserProfile(user);

		setIsRegistering(false);

		navigate(routes().home.chat.index);
	};

	return (
		<Form
			class="flex w-96 max-w-9/10 flex-col gap-6 p-4"
			of={signUpForm}
			onSubmit={signUpFormSubmitHandler}
		>
			<div class="flex flex-col justify-center gap-1">
				<h1 class="font-bold text-xl">Create Account</h1>

				<p class="text-sm opacity-75">
					Please enter your details to get started
				</p>
			</div>

			<Field of={signUpForm} path={["username"]}>
				{(field) => (
					<FieldTextInput
						{...field}
						icon={<UserRoundPlus class="opacity-50" />}
						label="Username"
						placeholder="John Micheal"
						type="text"
					/>
				)}
			</Field>

			<Field of={signUpForm} path={["email"]}>
				{(field) => (
					<FieldTextInput
						{...field}
						icon={<Mail class="opacity-50" />}
						label="Email"
						placeholder="johnmicheal@gmail.com"
						type="email"
					/>
				)}
			</Field>

			<Field of={signUpForm} path={["pass"]}>
				{(field) => (
					<FieldTextInput
						{...field}
						icon={<LockKeyhole class="opacity-50" />}
						label="Create Password"
						placeholder="Create a strong password"
						type="password"
					/>
				)}
			</Field>

			<Field of={signUpForm} path={["confirmPass"]}>
				{(field) => (
					<FieldTextInput
						{...field}
						icon={<RotateCcwKey class="opacity-50" />}
						label="Confirm Password"
						placeholder="Confirm your password"
						type="password"
					/>
				)}
			</Field>

			<label class="flex items-center gap-2 text-xs">
				<input
					checked={hasAcceptedTerms()}
					class="checkbox checkbox-xs bg-base-100"
					id="accept-terms-checkbox"
					onInput={(e) => setHasAcceptedTerms(e.target.checked)}
					type="checkbox"
				/>

				<span>
					I agree to the{" "}
					<A class="link link-primary ml-auto text-xs" href="#">
						Terms of Service
					</A>{" "}
					and{" "}
					<A class="link link-primary ml-auto text-xs" href="#">
						Privacy Policy
					</A>
					.
				</span>
			</label>

			<BaseButton
				class="btn-primary mx-auto w-full"
				disabled={isRegistering()}
				type="submit"
			>
				{isRegistering() ? (
					<span class="loading loading-spinner"></span>
				) : (
					"Create Account"
				)}
			</BaseButton>

			<div class="divider m-0 text-xs opacity-50">Or continue with</div>

			<div class="*:btn-secondary flex w-full gap-4 *:grow">
				<BaseButton>
					<GoogleLogo /> Google
				</BaseButton>

				<GuestLoginButton />
			</div>

			<p class="mx-auto mt-2 text-xs">
				Already have an account?{" "}
				<A class="link link-primary" href={routes().auth.signIn.index}>
					Sign In
				</A>
			</p>
		</Form>
	);
}

function HeroContent() {
	return (
		<div class="hidden h-[stretch] w-1/2 bg-linear-to-br from-primary via-5% to-accent p-4 md:block">
			{/* Wrapper to prevent layout shift to the hero content when the form overflows */}
			<div class="flex h-screen w-full flex-col items-center justify-center gap-4 *:text-center *:text-primary-content">
				<AppLogo class="*:size-16 *:fill-primary-content" />

				<h1 class="font-bold text-5xl">Join the Unipal Community</h1>

				<p class="mt-4 max-w-96 text-sm opacity-75">
					Your campus journey starts here. Get access to a 24/7 intelligent
					assistance for a smarter student life.
				</p>
			</div>
		</div>
	);
}

export default function SignUpPage() {
	return (
		<div class="size-full overflow-y-auto bg-base-200">
			{/* Wrapper so the hero content's background doesn't get "cut" when the form overflows */}
			<div class="items-center-safe flex size-full min-h-fit">
				<HeroContent />

				<div class="items-center-safe justify-center-safe flex w-screen p-4 md:w-1/2">
					<SignUpForm />
				</div>
			</div>
		</div>
	);
}
