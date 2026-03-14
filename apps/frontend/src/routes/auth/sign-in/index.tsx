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
import { getBackendBaseUrl, getGoogleClientId } from "~/constants/env";
import { promptGoogleIdToken, renderGoogleSignInButton } from "~/lib/google-identity";
import { loginAsGuest, loginWithEmailPassword, loginWithGoogleIdToken } from "~/utils/auth/auth-api";
import { SignInCredentialsSchema } from "~/models/credentials";
import { routes } from "~/RouteManifest";
import { clearAuthTokens, setAuthTokens } from "~/utils/auth-tokens";

function SignInForm() {
	const navigate = useNavigate();
	const [shouldRememberSignIn, setShouldRememberSignIn] = createSignal(false);
	const [googleBusy, setGoogleBusy] = createSignal(false);
	const [showGoogleOverlay, setShowGoogleOverlay] = createSignal(false);
	const [googleOverlayReason, setGoogleOverlayReason] = createSignal<string | null>(null);

	const signInForm = createForm({
		initialInput: {
			pass: "",
			user: "",
		},
		schema: SignInCredentialsSchema,
	});

	const backendBaseUrl = () => getBackendBaseUrl().replace(/\/+$/, "");

	const signInFormSubmitHandler: SubmitEventHandler<
		typeof SignInCredentialsSchema
	> = async (signInInfo, _ev) => {
		const res = await loginWithEmailPassword({
			baseUrl: backendBaseUrl(),
			email: signInInfo.user,
			password: signInInfo.pass,
		});

		if (!res.ok) {
			window.alert(res.message);
			return;
		}

		if (!shouldRememberSignIn()) clearAuthTokens();
		setAuthTokens(res.tokens);

		navigate(routes().home.chat.index);
	};

	const handleGuestLogin = async () => {
		const res = await loginAsGuest({ baseUrl: backendBaseUrl() });

		if (!res.ok) {
			window.alert(res.message);
			return;
		}

		if (!shouldRememberSignIn()) clearAuthTokens();
		setAuthTokens(res.tokens);

		navigate(routes().home.chat.index);
	};

	const handleGoogleLogin = async () => {
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
				context: "signin",
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

			if (!shouldRememberSignIn()) clearAuthTokens();
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

	const setupOverlayButton = async (container: HTMLElement) => {
		const clientId = getGoogleClientId();
		if (!clientId) return;

		await renderGoogleSignInButton({
			clientId,
			container,
			context: "signin",
		});
	};

	return (
		<>
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
					<BaseButton disabled={googleBusy()} onClick={handleGoogleLogin} type="button">
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
