import {
	createContext,
	createSignal,
	type JSXElement,
	type Setter,
	useContext,
} from "solid-js";
import type { UserBaseOutput } from "~/models/auth.schemas";
import AuthRpc from "~/rpc/auth";

interface AuthContextData {
	accessToken: string | null;
	setAccessToken: Setter<string | null>;
	userProfile: UserBaseOutput | null;
	setUserProfile: Setter<UserBaseOutput | null>;
	logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextData>();

export function AuthProvider(props: { children: JSXElement }) {
	const [accessToken, setAccessToken] = createSignal<string | null>(null);
	const [userProfile, setUserProfile] = createSignal<UserBaseOutput | null>(
		null,
	);

	async function logout() {
		setAccessToken(null);
		setUserProfile(null);

		await AuthRpc.logout.post();
	}

	return (
		<AuthContext.Provider
			value={{
				accessToken: accessToken(),
				logout,
				setAccessToken,
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
