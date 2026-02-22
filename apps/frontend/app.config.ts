import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import lucidePreprocess from "vite-plugin-lucide-preprocess";

export default defineConfig({
	server: {
		prerender: { crawlLinks: true },
	},
	vite: {
		plugins: [lucidePreprocess(), tailwindcss()],
	},
});
