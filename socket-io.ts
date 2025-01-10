import { Server } from 'socket.io';
import type { HttpServer } from 'vite';
import { pb } from './src/lib/pocketBase';
import { createLogMessage } from './src/lib/utils';
import type { AuthModel } from 'pocketbase';

export function attachSocket(server: HttpServer) {
	const io = new Server(server);

	let connectedUsers: string[] = [];

	let numberOfRingedContestant: number = 0;

	for (let contestantIndex = 1; contestantIndex <= 4; contestantIndex++) {
		pb.collection('users').update(`4t-contestant-${contestantIndex}`, { online: false });
	}

	io.on('connection', (socket) => {
		socket.emit('message', 'konnichiwa!');

		let userKey: string;

		console.log('Client mới truy cập:');
		console.log(
			`	ID: ${socket.id}
	Địa chỉ: ${socket.handshake.address}
	Platform: ${socket.handshake.headers['user-agent']}
	Thời gian: ${socket.handshake.time}
	Referer: ${socket.handshake.headers.referer}`
		);

		socket.on('knownUserAccessed', (user: AuthModel) => {
			if (user) {
				socket.data.user = user;
				userKey = `${socket.id}_${user.id}`;

				console.log('user recognized: ' + user.username);

				if (
					socket.data.user &&
					connectedUsers.findIndex((currentValue) => currentValue.endsWith(userKey.slice(21))) ===
						-1
				) {
					pb.collection(socket.data.user.collectionName).update(socket.data.user.id, {
						online: true
					});
					createLogMessage(
						'system',
						'INFO',
						`${user.username} (${socket.data.user.name}) đã truy cập`
					);
				}
				connectedUsers = [...connectedUsers, userKey];
			}
			console.log(connectedUsers);
		});

		socket.on('userLogOut', () => {
			if (socket.data.user) {
				connectedUsers.splice(connectedUsers.indexOf(userKey), 1);
				if (
					connectedUsers.findIndex((currentValue) => currentValue.endsWith(userKey.slice(21))) ===
					-1
				) {
					pb.collection(socket.data.user.collectionName).update(socket.data.user.id, {
						online: false
					});
					createLogMessage('system', 'INFO', `User ${socket.data.user.username} logged out.`);
					console.log(`User ${socket.data.user.username} logged out.`);
				}
			}
		});

		socket.on('bell', (game: string, userId: string) => {
			if (game === 'vcnv') {
				io.to('sounds').emit('sound', `bell_vcnv`);
				pb.collection('users').update(userId, { ring: 1 });
				console.log(`Bell rang by ${userId} in game ${game}`);
			} else if (game === 'clear') {
				numberOfRingedContestant = 0;
			} else {
				if (numberOfRingedContestant === 0) {
					numberOfRingedContestant++;
					io.to('sounds').emit('sound', `bell_${game}`);
					pb.collection('users').update(userId, { ring: 1 });

					pb.collection('display_status').update('4T-DISPLAYSTATE', {
						bellAllowed: false
					});
					console.log(`Bell rang by ${userId} in game ${game}`);
				}
			}
		});

		socket.on('message', (message: string) => {
			console.log(message);
			if (message === 'joinSound') socket.join('sounds');
		});

		socket.on('soundReq', (sound) => {
			if (socket.data.user && socket.data.user.username !== 'user_kt_2')
				io.to('sounds').emit('sound', sound);
		});

		socket.on('disconnect', (disconnectReason) => {
			console.log(`${socket.id} disconnected: ${disconnectReason}`);
			connectedUsers.splice(connectedUsers.indexOf(userKey), 1);
			console.log(connectedUsers);

			if (
				socket.data.user &&
				connectedUsers.findIndex((currentValue) => currentValue.endsWith(userKey.slice(21))) === -1
			) {
				pb.collection(socket.data.user.collectionName).update(socket.data.user.id ?? '', {
					online: false
				});
				createLogMessage(
					'system',
					'INFO',
					`${socket.data.user.username} (${socket.data.user.name}) đã bị mất kết nối`
				);
				console.log(
					`USER ${socket.data.user.name}[${socket.data.user.username}] (${userKey}) disconnected`
				);
			}
		});
	});
}
