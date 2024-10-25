import { Server } from 'socket.io';
import type { HttpServer } from 'vite';
import { pb } from './pocketBase';
import { createLogMessage } from './utils';

export function injectSocketIO(server: HttpServer) {
	const io = new Server(server);

	io.on('connection', (socket) => {
		console.log(socket.id);

		socket.on('user', async (user) => {
			// io.emit('message', message);
			console.log(user.username);
			if (user.collectionName === 'btc')
				await pb.collection('btc').update(user.id, { online: true });
			else if (user.collectionName === 'users') {
				await pb.collection('users').update(user.id, { online: true });
				createLogMessage('system', 'log in', user.username + ' logged in');
			}
			socket.on('disconnect', async () => {
				await pb.collection('users').update(user.id, { online: true });
				console.log(user.username + ' DISCONNCETED');
			});
		});
	});

	console.log('SocketIO injected');
}
