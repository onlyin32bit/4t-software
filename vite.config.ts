import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
// import type { ViteDevServer } from 'vite';
// import { injectSocketIO } from './src/lib/socket-io-server';

export default defineConfig({
	plugins: [
		sveltekit()
		// {
		// 	name: 'socket-io-server',
		// 	configureServer(server: ViteDevServer) {
		// 		if (!server.httpServer) return;

		// 		injectSocketIO(server.httpServer);
		// 	}
		// }
	]
});
