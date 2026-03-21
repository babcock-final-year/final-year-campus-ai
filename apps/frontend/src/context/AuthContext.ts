import { type Accessor, createContext, type Setter } from "solid-js";
import type { UserBaseOutput } from "~/models/users.schemas";

interface AuthContextData {
	accessToken: Accessor<string | null>;
	setAccessToken: Setter<string | null>;
	refreshToken: Accessor<string | null>;
	setRefreshToken: Setter<string | null>;
	userProfile: Accessor<UserBaseOutput | null>;
	setUserProfile: Setter<UserBaseOutput | null>;
	logout(): Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({
	accessToken() {
		return sessionStorage.getItem("accessToken");
	},
	async logout() {},
	refreshToken() {
		return sessionStorage.getItem("refreshToken");
	},
	setAccessToken() {},
	setRefreshToken() {},
	setUserProfile() {},
	userProfile() {
		return null;
	},
});
