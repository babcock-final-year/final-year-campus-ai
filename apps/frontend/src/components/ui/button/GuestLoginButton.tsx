import { Link } from "@kobalte/core/link";
import { useNavigate } from "@solidjs/router";
import { HatGlasses } from "lucide-solid";
import { createSignal } from "solid-js";
import { useAuth } from "~/context/AuthContextProvider";
import { useToastContext } from "~/context/ToastContextProvider";
import { routes } from "~/RouteManifest";
import AuthRpc from "~/rpc/auth";
import BaseButton from "./BaseButton";

interface GuestLoginButtonProps {
	shouldDisable?: boolean;
}

export default function GuestLoginButton(props: GuestLoginButtonProps) {
	const [isLoggingIn, setIsLoggingIn] = createSignal(false);
	const authContext = useAuth();

	const navigate = useNavigate();
	const toastContext = useToastContext();

	async function handleGuestLogin() {
		setIsLoggingIn(true);

		const res = await AuthRpc.guest.post();

		if (!res.success) {
			setIsLoggingIn(false);
			toastContext.showToast({
				description: res.err.message ?? "Unable to login as guest",
				title: "Guest login failed",
				type: "error",
			});
			return;
		}

		const { access_token, refresh_token, user } = res.res;

		authContext.setAccessToken(access_token);
		authContext.setRefreshToken(refresh_token);
		authContext.setUserProfile(user);

		setIsLoggingIn(false);

		navigate(routes().home.chat.index);
	}

	return (
		<BaseButton
			disabled={props.shouldDisable || isLoggingIn()}
			onClick={handleGuestLogin}
		>
			{isLoggingIn() ? (
				<span class="loading loading-spinner"></span>
			) : (
				<>
					<HatGlasses /> Guest
				</>
			)}
		</BaseButton>
	);
}
