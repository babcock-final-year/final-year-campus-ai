import { useNavigate } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import GoogleLogo from "~/components/ui/svg/GoogleLogo";
import { useAuth } from "~/context/AuthContextProvider";
import { routes } from "~/RouteManifest";
import AuthRpc from "~/rpc/auth";
import { getClientEnv } from "~/utils/env";
import BaseButton from "./BaseButton";

interface GoogleLoginButtonProps {
	shouldDisable?: boolean;
	onSuccess?: (res: unknown) => void;
	onError?: (err: unknown) => void;
}

/**
 * GoogleLoginButton
 *
 * A reusable button that triggers Google Sign-In (Google Identity Services).
 * - Initializes the GIS client on mount.
 * - On click it prompts the GIS account chooser / one-tap flow.
 * - On credential callback it sends the ID token to the backend via AuthRpc.google.post.
 *
 * Notes:
 * - Ensure VITE_GOOGLE_CLIENT_ID is set in your frontend environment.
 */
export default function GoogleLoginButton(props: GoogleLoginButtonProps) {
	const [isProcessing, setIsProcessing] = createSignal(false);
	const [isGisReady, setIsGisReady] = createSignal(false);
	const authContext = useAuth();
	const navigate = useNavigate();

	const redirectRoute = () => routes().home.chat.index;

	// Load the Google Identity Services script and initialize
	onMount(() => {
		const existing = document.querySelector(
			'script[src="https://accounts.google.com/gsi/client"]',
		) as HTMLScriptElement | null;

		if (
			existing &&
			(existing as HTMLScriptElement).getAttribute("data-gis-loaded") === "1"
		) {
			// Script already loaded and initialized elsewhere; try to init local handlers
			tryInitGis();
			return;
		}

		if (!existing) {
			const s = document.createElement("script");
			s.src = "https://accounts.google.com/gsi/client";
			s.async = true;
			s.defer = true;
			s.onload = () => {
				s.setAttribute("data-gis-loaded", "1");
				tryInitGis();
			};
			s.onerror = () => {
				props.onError?.(new Error("Failed to load Google Identity Services"));
			};
			document.head.appendChild(s);
		} else {
			// Script exists but may not have finished loading yet
			existing.addEventListener("load", () => {
				existing.setAttribute("data-gis-loaded", "1");
				tryInitGis();
			});
			if (existing.getAttribute("data-gis-loaded") === "1") {
				tryInitGis();
			}
		}
	});

	function tryInitGis() {
		// @ts-expect-error - Google script adds `google.accounts.id` to window at runtime
		if (!window?.google?.accounts?.id) {
			props.onError?.(new Error("Google Identity Services not available"));
			return;
		}

		const clientId = getClientEnv().VITE_GOOGLE_CLIENT_ID;

		// Initialize only once per page
		// @ts-expect-error - runtime API
		if (!window.google._unipal_gis_initialized) {
			// @ts-expect-error - runtime API
			window.google.accounts.id.initialize({
				callback: handleCredentialResponse,
				client_id: clientId,
			});
			// Mark initialized to avoid duplicate init in other mounts
			// @ts-expect-error
			window.google._unipal_gis_initialized = true;
		}

		setIsGisReady(true);
	}

	async function handleCredentialResponse(response: unknown) {
		//@ts-expect-error Need to find out the type
		const idToken = response?.credential;
		if (!idToken) {
			props.onError?.(new Error("No credential received from Google"));
			setIsProcessing(false);
			return;
		}

		try {
			const res = await AuthRpc.google.post({ token: idToken });

			if (!res.success) {
				props.onError?.(res.err);
				setIsProcessing(false);
				return;
			}

			const { access_token, refresh_token, user } = res.res;

			authContext?.setAccessToken(access_token);
			authContext?.setUserProfile(user);

			props.onSuccess?.(res.res);

			setIsProcessing(false);
			navigate(redirectRoute());
		} catch (err) {
			props.onError?.(err);
		} finally {
			setIsProcessing(false);
		}
	}

	function handleClick() {
		setIsProcessing(true);

		// If already disabled, noop
		if (props.shouldDisable) {
			setIsProcessing(false);
			return;
		}

		// If Google Identity Services is ready, prompt the chooser / one-tap UI
		// @ts-expect-error - runtime API
		if (isGisReady() && window?.google?.accounts?.id) {
			// This will open the account chooser / one-tap. The callback registered in initialize()
			// will receive the credential when the user completes signin.
			// @ts-expect-error - runtime API
			window.google.accounts.id.prompt();
			return;
		}

		// If GIS not ready, surface an error
		props.onError?.(
			new Error("Google Sign-In not ready. Please try again shortly."),
		);

		setIsProcessing(false);
	}

	return (
		<BaseButton
			disabled={props.shouldDisable || isProcessing()}
			onClick={handleClick}
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
