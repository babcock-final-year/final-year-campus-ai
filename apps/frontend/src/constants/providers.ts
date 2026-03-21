import { GoogleOAuthProvider } from "google-oauth-gsi";
import { getClientEnv } from "~/utils/env";

export const googleProvider = new GoogleOAuthProvider({
	clientId: getClientEnv().VITE_GOOGLE_CLIENT_ID,
});
