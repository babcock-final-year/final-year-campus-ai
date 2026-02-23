import {
	createForm,
	Field,
	Form,
	type SubmitEventHandler,
} from "@formisch/solid";
import { A } from "@solidjs/router";
import { LockKeyhole, UserRoundPlus } from "lucide-solid";
import BaseButton from "~/components/button/BaseButton";
import FieldTextInput from "~/components/form/FieldTextInput";
import AppLogo from "~/components/svg/AppLogo";
import GoogleLogo from "~/components/svg/GoogleLogo";
import { SignInCredentialsSchema } from "~/models/credentials";
import { routes } from "~/RouteManifest";

export default function SignInPage() {
	const signInForm = createForm({
		initialInput: {
			pass: "",
			user: "",
		},
		schema: SignInCredentialsSchema,
	});

	const signInFormSubmitHandler: SubmitEventHandler<
		typeof SignInCredentialsSchema
	> = async (_signInInfo, _ev) => {
		// TODO: add functionality
	};

	return (
		<div class="grid size-full place-items-center overflow-auto">
			<div class="flex flex-col items-center justify-center gap-8 p-4 sm:flex-row sm:gap-16">
				<div class="flex flex-col items-center justify-center gap-4">
					<AppLogo class="*:h-auto *:w-16" />

					<h1 class="font-bold text-2xl">Welcome back!</h1>

					<p>Sign in to continue with CampusAI</p>
				</div>

				<Form
					class="mt-4 flex flex-col gap-4"
					of={signInForm}
					onSubmit={signInFormSubmitHandler}
				>
					<Field of={signInForm} path={["user"]}>
						{(field) => (
							<FieldTextInput
								{...field}
								icon={<UserRoundPlus class="opacity-50" />}
								label="Username / Email"
								placeholder="PotentialMan69"
								type="text"
							/>
						)}
					</Field>

					<Field of={signInForm} path={["pass"]}>
						{(field) => (
							<FieldTextInput
								{...field}
								icon={<LockKeyhole class="opacity-50" />}
								label="Password"
								placeholder="Enter your password"
								type="password"
							/>
						)}
					</Field>

					<A class="link link-primary ml-auto text-xs" href="#">
						Forgot Password
					</A>

					<BaseButton class="btn-primary mx-auto w-full" type="submit">
						Sign In
					</BaseButton>

					<div class="divider m-0 text-xs">Or continue with</div>

					<BaseButton class="mx-auto w-full">
						<GoogleLogo /> Google
					</BaseButton>

					<p class="mx-auto text-xs">
						Don't have an account?{" "}
						<A class="link link-primary" href={routes().auth.signUp.index}>
							Sign Up
						</A>
					</p>
				</Form>
			</div>
		</div>
	);
}
