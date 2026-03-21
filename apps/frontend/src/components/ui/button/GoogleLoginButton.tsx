import { useNavigate } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import GoogleLogo from "~/components/ui/svg/GoogleLogo";
import { googleProvider } from "~/constants/providers";
import { useAuth } from "~/context/AuthContextProvider";
import { useToastContext } from "~/context/ToastContextProvider";
import { routes } from "~/RouteManifest";
import AuthRpc from "~/rpc/auth";
import { getClientEnv } from "~/utils/env";
import BaseButton from "./BaseButton";

interface GoogleLoginButtonProps {
	shouldDisable?: boolean;
}

export default function GoogleLoginButton(props: GoogleLoginButtonProps) {
	const [isProcessing, setIsProcessing] = createSignal(false);
	const authContext = useAuth();
	const navigate = useNavigate();
	const toast = useToastContext();

	const googleLogin = googleProvider.useGoogleOneTapLogin({
		cancel_on_tap_outside: true,
		onError() {
			toast.showToast({
				class: { alert: "alert-error", closeBtn: "btn-error" },
				description: "An error occurred during Google sign-in.",
				title: "Google One-Tap Error",
			});
			console.error("Error on google onetap login");
			setIsProcessing(false);
		},
		async onSuccess({ credential }) {
			if (!credential) {
				toast.showToast({
					class: { alert: "alert-error", closeBtn: "btn-error" },
					description: "No credential returned from Google.",
					title: "Google Sign-In Failed",
				});
				console.error("Couldn't get google one tap credential");

				setIsProcessing(false);
				return;
			}

			const res = await AuthRpc.google.post({ token: credential });

			if (!res.success) {
				toast.showToast({
					class: { alert: "alert-error", closeBtn: "btn-error" },
					description: "Could not sign in with Google. Please try again.",
					title: "Sign-In Failed",
				});
				setIsProcessing(false);
				return;
			}

			const {
				access_token: backend_access_token,
				refresh_token,
				user,
			} = res.res;

			authContext.setAccessToken(backend_access_token);
			authContext.setRefreshToken(refresh_token);
			authContext.setUserProfile(user);

			setIsProcessing(false);

			toast.showToast({
				class: { alert: "alert-success", closeBtn: "btn-success" },
				description: "Welcome back!",
				title: "Signed in",
			});

			navigate(routes().home.chat.index);
		},
		use_fedcm_for_prompt: true,
	});

	function handleGoogleLoginOnClick() {
		setIsProcessing(true);

		googleLogin();
	}

	return (
		<BaseButton
			disabled={props.shouldDisable || isProcessing()}
			onClick={handleGoogleLoginOnClick}
		>
			{isProcessing() ? (
				<span class="loading loading-spinner"></span>
			) : (
				<>
					<GoogleLogo /> Google
				</>
			)}
		</BaseButton>
	);
}
