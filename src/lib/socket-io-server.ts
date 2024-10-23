import { Server } from 'socket.io';
import type { HttpServer } from 'vite';

export function injectSocketIO(server: HttpServer) {
	const io = new Server(server);

	io.on('connection', (socket) => {
		console.log(socket.id);

		socket.on('message', (message) => {
			io.emit('message', message);
		});
	});

	console.log('SocketIO injected');
}
