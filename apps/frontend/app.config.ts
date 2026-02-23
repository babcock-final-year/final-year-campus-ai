import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import solidStartTypesafeRouterPlugin from "solid-start-typesafe-routes-plugin";
import lucidePreprocess from "vite-plugin-lucide-preprocess";

export default defineConfig({
	server: {
		prerender: { crawlLinks: true },
	},
	vite: {
		plugins: [
			lucidePreprocess(),
			solidStartTypesafeRouterPlugin(),
			tailwindcss(),
		],
	},
});
