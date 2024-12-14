import { Server } from 'socket.io';
import type { HttpServer } from 'vite';
import { pb } from './src/lib/pocketBase';
import { createLogMessage } from './src/lib/utils';
import type { AuthModel } from 'pocketbase';

export function attachSocket(server: HttpServer) {
	const io = new Server(server);

	const connectedUsers = new Map<string, AuthModel>();

	io.on('connection', (socket) => {
		socket.emit('message', 'konnichiwa!');

		let userData: AuthModel = null;
		const referer = socket.handshake.headers.referer;

		console.log('Client mới truy cập:');
		console.log(
			`	ID: ${socket.id}
	Địa chỉ: ${socket.handshake.address}
	Platform: ${socket.handshake.headers['user-agent']}
	Thời gian: ${socket.handshake.time}
	Referer: ${referer}`
		);

		socket.on('knownUserAccessed', (user: AuthModel) => {
			if (user && connectedUsers.get(user.id) === undefined) {
				connectedUsers.set(user.id, user);
				console.log('user recognized: ' + user.username);
				console.log(userData);
				if (userData) {
					pb.collection(userData.collectionName).update(userData.id, { online: true });
					createLogMessage('system', 'INFO', `${user.username} (${userData.name}) đã truy cập`);
				}
			}
			userData = user;
		});

		socket.on('userLogOut', () => {
			if (userData) {
				pb.collection(userData.collectionName).update(userData.id ?? '', { online: false });
				console.log(`User ${userData.username} logged out at ${''}`);
			}
		});

		socket.on('message', (message) => {
			console.log(message);
			if (message === 'joinSound') socket.join('sounds');
		});

		socket.on('soundReq', (sound) => {
			if (userData?.username !== 'user_kt_2') io.to('sounds').emit('sound', sound);
			// socket.emit('sound', sound);
		});

		socket.on('disconnect', (disconnectReason) => {
			console.log(`${socket.id} disconnected: ${disconnectReason}`);

			if (userData) {
				pb.collection(userData.collectionName).update(userData.id ?? '', { online: false });
				createLogMessage(
					'system',
					'INFO',
					`${userData.username} (${userData.name}) đã bị mất kết nối`
				);
			}
		});
	});
}
