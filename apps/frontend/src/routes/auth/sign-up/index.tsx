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
import AppLogo from "~/components/ui/svg/AppLogo";
import GoogleLogo from "~/components/ui/svg/GoogleLogo";
import { getBackendBaseUrl, getGoogleClientId } from "~/constants/env";
import { promptGoogleIdToken, renderGoogleSignInButton } from "~/lib/google-identity";
import { SignUpCredentialsSchema } from "~/models/credentials";
import { routes } from "~/RouteManifest";
import { loginAsGuest, loginWithGoogleIdToken, registerWithEmailPassword } from "~/utils/auth/auth-api";
import { clearAuthTokens, setAuthTokens } from "~/utils/auth-tokens";

function SignUpForm() {
	const navigate = useNavigate();
	const [hasAcceptedTerms, setHasAcceptedTerms] = createSignal(false);
	const [googleBusy, setGoogleBusy] = createSignal(false);
	const [showGoogleOverlay, setShowGoogleOverlay] = createSignal(false);
	const [googleOverlayReason, setGoogleOverlayReason] = createSignal<string | null>(null);

	const signUpForm = createForm({
		initialInput: { confirmPass: "", email: "", pass: "", username: "" },
		schema: SignUpCredentialsSchema,
	});

	const backendBaseUrl = () => getBackendBaseUrl().replace(/\/+$/, "");

	const signUpFormSubmitHandler: SubmitEventHandler<
		typeof SignUpCredentialsSchema
	> = async (signUpInfo, _ev) => {
		if (!hasAcceptedTerms()) return;

		const res = await registerWithEmailPassword({
			baseUrl: backendBaseUrl(),
			email: signUpInfo.email,
			fullName: signUpInfo.username,
			password: signUpInfo.pass,
		});

		if (!res.ok) {
			window.alert(res.message);
			return;
		}

		clearAuthTokens();
		setAuthTokens(res.tokens);

		navigate(routes().home.chat.index);
	};

	const setupOverlayButton = async (container: HTMLElement) => {
		const clientId = getGoogleClientId();
		if (!clientId) return;

		await renderGoogleSignInButton({
			clientId,
			container,
			context: "signup",
		});
	};

	const handleGoogleSignUp = async () => {
		if (googleBusy()) return;

		const clientId = getGoogleClientId();
		if (!clientId) {
			window.alert("Missing VITE_GOOGLE_CLIENT_ID in the frontend env");
			return;
		}

		setGoogleBusy(true);

		try {
			const idToken = await promptGoogleIdToken({
				clientId,
				context: "signup",
				onSuppressed: ({ kind, reason }) => {
					setGoogleOverlayReason(`${kind}:${reason}`);
					setShowGoogleOverlay(true);
				},
			});

			const exchanged = await loginWithGoogleIdToken({
				baseUrl: backendBaseUrl(),
				idToken,
			});

			if (!exchanged.ok) {
				window.alert(exchanged.message);
				return;
			}

			clearAuthTokens();
			setAuthTokens(exchanged.tokens);

			navigate(routes().home.chat.index);
		} catch (err) {
			const message =
				typeof err === "object" &&
				err !== null &&
				"message" in err &&
				typeof (err as { message?: unknown }).message === "string"
					? String((err as { message: string }).message)
					: "Google sign-in failed";

			window.alert(message);
		} finally {
			setGoogleBusy(false);
		}
	};

	const onGuest = async () => {
		const res = await loginAsGuest({ baseUrl: backendBaseUrl() });

		if (!res.ok) {
			window.alert(res.message);
			return;
		}

		clearAuthTokens();
		setAuthTokens(res.tokens);

		navigate(routes().home.chat.index);
	};

	return (
		<>
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
				disabled={!hasAcceptedTerms()}
				type="submit"
			>
				Create Account
			</BaseButton>

			<div class="divider m-0 text-xs opacity-50">Or continue with</div>

			<div class="*:btn-secondary flex w-full gap-4 *:grow">
				<BaseButton disabled={googleBusy()} onClick={handleGoogleSignUp} type="button">
					<GoogleLogo /> Google
				</BaseButton>

				<BaseButton class="btn" onClick={onGuest} type="button">
					<HatGlasses /> Guest
				</BaseButton>
			</div>

			<p class="mx-auto mt-2 text-xs">
				Already have an account?{" "}
				<A class="link link-primary" href={routes().auth.signIn.index}>
					Sign In
				</A>
			</p>
			</Form>

			{showGoogleOverlay() ? (
				<div
					aria-modal="true"
					class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
					role="dialog"
				>
					<div class="w-full max-w-sm rounded-box bg-base-100 p-4 shadow">
						<div class="flex items-start justify-between gap-4">
							<div>
								<h3 class="font-semibold">Continue with Google</h3>
								<p class="mt-1 text-xs opacity-70">
									One Tap is unavailable. Use the official Google button below.
								</p>
								{googleOverlayReason() ? (
									<p class="mt-2 text-[11px] opacity-60">
										Reason: {googleOverlayReason()}
									</p>
								) : null}
							</div>

							<button
								aria-label="Close"
								class="btn btn-ghost btn-sm"
								onClick={() => setShowGoogleOverlay(false)}
								type="button"
							>
								✕
							</button>
						</div>

						<div
							class="mt-4 flex justify-center"
							ref={(el) => {
								void setupOverlayButton(el);
							}}
						/>
					</div>
				</div>
			) : null}
		</>
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
