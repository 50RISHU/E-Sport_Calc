import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		noExternal: ['@supabase/supabase-js']
	},
	server: {
		host: true,
		allowedHosts: ['201d0e7cd063.ngrok-free.app']
	}
});
