import { googleLogout } from "google-oauth-gsi";
import {
	createContext,
	createEffect,
	createSignal,
	type JSXElement,
	onMount,
	type Setter,
	useContext,
} from "solid-js";
import type { UserBaseOutput } from "~/models/users.schemas";
import AuthRpc from "~/rpc/auth";

interface AuthContextData {
	accessToken: string | null;
	setAccessToken: Setter<string | null>;
	refreshToken: string | null;
	setRefreshToken: Setter<string | null>;
	userProfile: UserBaseOutput | null;
	setUserProfile: Setter<UserBaseOutput | null>;
	logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextData>();

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
				accessToken: accessToken(),
				logout,
				refreshToken: refreshToken(),
				setAccessToken,
				setRefreshToken,
				setUserProfile,
				userProfile: userProfile(),
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
