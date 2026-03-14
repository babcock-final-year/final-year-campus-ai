declare global {
	interface Window {
		google?: unknown;
	}
}

type GoogleCredentialResponse = {
	credential?: string;
	select_by?: string;
	clientId?: string;
};

type GooglePromptMomentNotification = {
	isDisplayed: () => boolean;
	isNotDisplayed: () => boolean;
	getNotDisplayedReason: () => string;
	isSkippedMoment: () => boolean;
	getSkippedReason: () => string;
	isDismissedMoment: () => boolean;
	getDismissedReason: () => string;
	getMomentType?: () => string;
};

type GoogleIdApi = {
	initialize: (args: {
		client_id: string;
		callback: (res: GoogleCredentialResponse) => void;
		auto_select?: boolean;
		cancel_on_tap_outside?: boolean;
		context?: "signin" | "signup" | "use";
	}) => void;
	prompt: (momentListener?: (notification: GooglePromptMomentNotification) => void) => void;
	renderButton: (
		parent: HTMLElement,
		options?: Record<string, string | number | boolean | undefined>,
	) => void;
};

let loadPromise: Promise<void> | null = null;

function isGisReady(): boolean {
	return getGoogleIdApi() !== null;
}

function getGoogleIdApi(): GoogleIdApi | null {
	const g = window.google;
	if (!g || typeof g !== "object") return null;

	if (!("accounts" in g)) return null;
	const accounts = (g as { accounts?: unknown }).accounts;
	if (!accounts || typeof accounts !== "object") return null;

	if (!("id" in accounts)) return null;
	const id = (accounts as { id?: unknown }).id;
	if (!id || typeof id !== "object") return null;

	if (
		!("initialize" in id) ||
		typeof (id as { initialize?: unknown }).initialize !== "function"
	) {
		return null;
	}

	if (!("prompt" in id) || typeof (id as { prompt?: unknown }).prompt !== "function") {
		return null;
	}

	if (
		!("renderButton" in id) ||
		typeof (id as { renderButton?: unknown }).renderButton !== "function"
	) {
		return null;
	}

	return id as GoogleIdApi;
}

function findExistingScript(): HTMLScriptElement | null {
	const scripts = document.querySelectorAll("script");
	for (const s of scripts) {
		const src = s.getAttribute("src") ?? "";
		if (src === "https://accounts.google.com/gsi/client") return s;
	}

	return null;
}

export function loadGoogleIdentityScript(): Promise<void> {
	if (typeof window === "undefined" || typeof document === "undefined") {
		return Promise.reject(
			new Error("Google Identity Services can only be loaded in the browser"),
		);
	}

	if (isGisReady()) return Promise.resolve();

	if (loadPromise) return loadPromise;

	loadPromise = new Promise<void>((resolve, reject) => {
		const existing = findExistingScript();

		const onLoad = () => resolve();
		const onError = () => reject(new Error("Failed to load Google Identity Services script"));

		if (existing) {
			if (isGisReady()) return resolve();

			existing.addEventListener("load", onLoad, { once: true });
			existing.addEventListener("error", onError, { once: true });
			return;
		}

		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		script.addEventListener("load", onLoad, { once: true });
		script.addEventListener("error", onError, { once: true });

		document.head.appendChild(script);
	});

	return loadPromise;
}

export async function renderGoogleSignInButton(args: {
	container: HTMLElement;
	clientId: string;
	context: "signin" | "signup";
}): Promise<void> {
	if (typeof window === "undefined" || typeof document === "undefined") {
		throw new Error("Google sign-in can only run in the browser");
	}

	if (!args.clientId) {
		throw new Error("Missing Google client id");
	}

	await loadGoogleIdentityScript();

	const googleId = getGoogleIdApi();
	if (!googleId) {
		throw new Error("Google Identity Services did not initialize correctly");
	}

	googleId.initialize({
		callback: () => {},
		client_id: args.clientId,
		context: args.context,
	});

	args.container.innerHTML = "";
	googleId.renderButton(args.container, {
		type: "standard",
		theme: "outline",
		size: "large",
		text: args.context === "signup" ? "signup_with" : "signin_with",
		shape: "rectangular",
		width: 320,
	});
}

export async function promptGoogleIdToken(args: {
	clientId: string;
	context: "signin" | "signup";
	onSuppressed?: (info: { kind: "not_displayed" | "skipped" | "dismissed"; reason: string }) => void;
}): Promise<string> {
	if (typeof window === "undefined" || typeof document === "undefined") {
		throw new Error("Google sign-in can only run in the browser");
	}

	if (!args.clientId) {
		throw new Error("Missing Google client id");
	}

	await loadGoogleIdentityScript();

	const googleId = getGoogleIdApi();
	if (!googleId) {
		throw new Error("Google Identity Services did not initialize correctly");
	}

	return await new Promise<string>((resolve, reject) => {
		let settled = false;

		googleId.initialize({
			callback: (res) => {
				if (settled) return;
				settled = true;

				const token = res.credential;
				if (!token) {
					reject(new Error("Google did not return an ID token"));
					return;
				}

				resolve(token);
			},
			client_id: args.clientId,
			context: args.context,
		});

		try {
			googleId.prompt((notification) => {
				const details: Record<string, unknown> = {
					context: args.context,
					displayed: notification.isDisplayed(),
					notDisplayed: notification.isNotDisplayed(),
					skipped: notification.isSkippedMoment(),
					dismissed: notification.isDismissedMoment(),
				};

				if (notification.getMomentType) {
					details["momentType"] = notification.getMomentType();
				}

				if (notification.isNotDisplayed()) {
					const reason = notification.getNotDisplayedReason();
					details["notDisplayedReason"] = reason;
					console.warn("[gis] prompt not displayed", details);
					args.onSuppressed?.({ kind: "not_displayed", reason });
					return;
				}

				if (notification.isSkippedMoment()) {
					const reason = notification.getSkippedReason();
					details["skippedReason"] = reason;
					console.warn("[gis] prompt skipped", details);
					args.onSuppressed?.({ kind: "skipped", reason });
					return;
				}

				if (notification.isDismissedMoment()) {
					const reason = notification.getDismissedReason();
					details["dismissedReason"] = reason;
					console.warn("[gis] prompt dismissed", details);
					args.onSuppressed?.({ kind: "dismissed", reason });
					return;
				}

				console.info("[gis] prompt moment", details);
			});
		} catch (err) {
			if (settled) return;
			settled = true;

			const message =
				typeof err === "object" &&
				err !== null &&
				"message" in err &&
				typeof (err as { message?: unknown }).message === "string"
					? String((err as { message: string }).message)
					: "Google sign-in prompt failed";

			reject(new Error(message));
		}
	});
}
