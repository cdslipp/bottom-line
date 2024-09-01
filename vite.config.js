import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: ['@passageidentity/passage-node'] // Add this line to prevent Vite from processing this module
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
