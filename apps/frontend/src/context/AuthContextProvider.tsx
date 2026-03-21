import { googleLogout } from "google-oauth-gsi";
import {
	createEffect,
	createSignal,
	type JSXElement,
	onMount,
	useContext,
} from "solid-js";
import type { UserBaseOutput } from "~/models/users.schemas";
import AuthRpc from "~/rpc/auth";
import { AuthContext } from "./AuthContext";

export function AuthProvider(props: { children: JSXElement }) {
	const [accessToken, setAccessToken] = createSignal<string | null>(null);
	const [refreshToken, setRefreshToken] = createSignal<string | null>(null);
	const [userProfile, setUserProfile] = createSignal<UserBaseOutput | null>(
		null,
	);

	async function logout() {
		setAccessToken(null);
		setUserProfile(null);

		googleLogout();

		await AuthRpc.logout.post();
	}

	onMount(() => {
		const { access, refresh } = {
			access: sessionStorage.getItem("accessToken"),
			refresh: sessionStorage.getItem("refreshToken"),
		} as const;

		if (access) setAccessToken(access);

		if (refresh) {
			setRefreshToken(refresh);
		}
	});

	createEffect(() => {
		const accessTkn = accessToken(),
			refreshTkn = refreshToken();

		if (accessTkn) sessionStorage.setItem("accessToken", accessTkn);

		if (refreshTkn) sessionStorage.setItem("refreshToken", refreshTkn);
	});

	return (
		<AuthContext.Provider
			value={{
				accessToken,
				logout,
				refreshToken,
				setAccessToken,
				setRefreshToken,
				setUserProfile,
				userProfile,
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const auth = useContext(AuthContext);

	if (!auth) throw Error("useAuth: cannot find AuthContext");

	return auth;
}
