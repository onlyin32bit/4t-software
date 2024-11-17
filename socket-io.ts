import { Server } from 'socket.io';
import type { HttpServer } from 'vite';
import { pb } from './src/lib/pocketBase';
import { createLogMessage } from './src/lib/utils';
import type { AuthModel } from 'pocketbase';

export function attachSocket(server: HttpServer) {
	const io = new Server(server);

	io.on('connection', (socket) => {
		socket.emit('message', 'Hello World from server!');

		let userData: AuthModel = null;

		console.log(
			`Thiết bị mới truy cập: 
	ID: ${socket.id}
	Địa chỉ: ${socket.handshake.address}
	Platform: ${socket.handshake.headers['user-agent']}
	Thời gian: ${socket.handshake.time}`
		);

		socket.on('knownUserAccessed', (user) => {
			userData = user;
			console.log('user recognized: ' + user.username);
			console.log(userData);
			if (userData) {
				pb.collection(userData?.collectionName).update(userData?.id, { online: true });
				createLogMessage('system', 'INFO', `${user.username} (${userData.name}) đã truy cập`);
			}
		});

		socket.on('userLogOut', () => {
			if (userData) {
				pb.collection(userData?.collectionName).update(userData?.id ?? '', { online: false });
				console.log(`User ${userData.username} logged out at ${''}`);
			}
		});

		socket.on('message', (message) => {
			console.log(message);
		});

		socket.on('disconnect', (disconnectReason) => {
			if (userData) {
				pb.collection(userData?.collectionName).update(userData?.id ?? '', { online: false });
				createLogMessage(
					'system',
					'INFO',
					`${userData.username} (${userData.name}) đã bị mất kết nối`
				);
			}
			console.log(
				(userData ? userData?.username : socket.id) + ' disconnected: ' + disconnectReason
			);
		});
	});
}
