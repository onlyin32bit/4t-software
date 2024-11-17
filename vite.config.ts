import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import type { ViteDevServer } from 'vite';
import { attachSocket } from './socket-io';
import * as dotenv from 'dotenv';

dotenv.config();

const socketIO = {
	name: 'socketIO',
	configureServer(server: ViteDevServer) {
		attachSocket(server.httpServer!);
	}
};

export default defineConfig({
	plugins: [sveltekit(), socketIO],
	define: {
		'process.env.PUBLIC_DB_ADDRESS': JSON.stringify(process.env.PUBLIC_DB_ADDRESS)
	}
});
