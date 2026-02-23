import {
	createForm,
	Field,
	Form,
	type SubmitEventHandler,
} from "@formisch/solid";
import { A } from "@solidjs/router";
import { HatGlasses, LockKeyhole, Mail, UserRoundPlus } from "lucide-solid";
import { createSignal } from "solid-js";
import BaseButton from "~/components/button/BaseButton";
import FieldTextInput from "~/components/form/FieldTextInput";
import AppLogo from "~/components/svg/AppLogo";
import GoogleLogo from "~/components/svg/GoogleLogo";
import { SignUpCredentialsSchema } from "~/models/credentials";
import { routes } from "~/RouteManifest";

export default function SignUpPage() {
	const [hasAcceptedTerms, setHasAcceptedTerms] = createSignal(false);

	const signUpForm = createForm({
		initialInput: {
			email: "",
			pass: "",
			username: "",
		},
		schema: SignUpCredentialsSchema,
	});

	const signUpFormSubmitHandler: SubmitEventHandler<
		typeof SignUpCredentialsSchema
	> = async (_signUpInfo, _ev) => {
		// TODO: add functionality
	};

	return (
		<div class="grid size-full place-items-center overflow-auto">
			<div class="flex flex-col items-center justify-center gap-8 p-4 sm:flex-row sm:gap-16">
				<div class="flex flex-col items-center justify-center gap-4">
					<AppLogo class="*:h-auto *:w-16" />

					<h1 class="font-bold text-2xl">Sign Up</h1>

					<p>Sign in to continue with CampusAI</p>
				</div>

				<Form
					class="flex flex-col gap-4"
					of={signUpForm}
					onSubmit={signUpFormSubmitHandler}
				>
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
								label="Password"
								placeholder="Create a strong password"
								type="password"
							/>
						)}
					</Field>

					<label class="flex items-center gap-2 text-xs">
						<input
							checked={hasAcceptedTerms()}
							class="checkbox checkbox-xs"
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

					<BaseButton class="btn-primary mx-auto w-full" type="submit">
						Create Account
					</BaseButton>

					<div class="divider m-0 text-xs">Or continue with</div>

					<div class="flex w-full gap-4">
						<BaseButton class="grow">
							<GoogleLogo /> Google
						</BaseButton>

						<BaseButton class="grow">
							<HatGlasses /> Guest
						</BaseButton>
					</div>

					<p class="mx-auto text-xs">
						Already have an account?{" "}
						<A class="link link-primary" href={routes().auth.signIn.index}>
							Sign In
						</A>
					</p>
				</Form>
			</div>
		</div>
	);
}
