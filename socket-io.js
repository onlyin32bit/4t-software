/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Server } from 'socket.io';
import PocketBase from 'pocketbase';
import { configDotenv } from 'dotenv';

configDotenv();

const pb = new PocketBase(`http://${process.env.PUBLIC_PB_ADDR ?? '127.0.0.1'}:8090`);
pb.autoCancellation(false);

function timestamp() {
	const now = new Date();
	return now.toISOString().replace('T', ' ').split('.')[0];
}

function debug(tag, ...msg) {
	console.log(`[${timestamp()}][${tag}]`, ...msg);
}

async function safe(fn) {
	try {
		return await fn();
	} catch (e) {
		debug('ERROR', e.message || e);
	}
}

async function log(from, type, content) {
	await safe(() =>
		pb.collection('logs').create({
			time: new Date().toLocaleString('vi-VN'),
			from,
			type,
			content
		})
	);
}

async function setOnline(user, online) {
	if (!user?.collectionName || !user?.id) return;
	debug('PB', `Set ${user.username || user.id} online=${online}`);
	await safe(() => pb.collection(user.collectionName).update(user.id, { online }));
}

async function setRing(userId, ring = 1) {
	debug('RING', `Set ring=${ring} for user ${userId}`);
	await safe(() => pb.collection('users').update(userId, { ring }));
}

async function resetContestants() {
	debug('INIT', 'Resetting contestants online state...');
	for (let i = 1; i <= 4; i++) {
		await setOnline({ collectionName: 'users', id: `4t-contestant-${i}` }, false);
	}
	debug('INIT', 'Contestants reset complete.');
}

export function attachSocket(server) {
	const io = new Server(server, { cors: { origin: '*' }, pingInterval: 10000, pingTimeout: 20000 });
	const users = new Map(); // userId -> { sockets:Set, lastSeen:number }
	let ringed = 0;

	resetContestants();
	users.clear();

	async function markOnline(user) {
		const state = users.get(user.id);
		const dbUser = await safe(() => pb.collection(user.collectionName).getOne(user.id));
		const shouldSync = !dbUser?.online;

		if (!state) {
			users.set(user.id, { sockets: new Set(), lastSeen: Date.now() });
			debug('ONLINE', `${user.username} first seen. Marking online.`);
			await setOnline(user, true);
			await log('system', 'INFO', `${user.username} (${user.name}) online`);
		} else if (shouldSync) {
			debug('SYNC', `${user.username} marked online (DB sync)`);
			await setOnline(user, true);
		} else {
			debug('ONLINE', `${user.username} already online, skipping duplicate.`);
		}
	}
	const disconnectTimers = new Map(); // userId -> timeout

	async function markOffline(user) {
		const state = users.get(user.id);
		if (!state || state.sockets.size > 0) return;

		if (disconnectTimers.has(user.id)) clearTimeout(disconnectTimers.get(user.id));
		const timer = setTimeout(async () => {
			if (state.sockets.size === 0) {
				users.delete(user.id);
				debug('OFFLINE', `${user.username} confirmed offline (after debounce)`);
				await setOnline(user, false);
				await log('system', 'INFO', `${user.username} offline`);
			}
			disconnectTimers.delete(user.id);
		}, 2000);
		disconnectTimers.set(user.id, timer);
	}

	io.on('connection', (socket) => {
		debug('SOCKET', `New connection: ${socket.id}`);
		socket.emit('message', 'konnichiwa');
		let user = null;

		socket.on('knownUserAccessed', async (data) => {
			debug('EVENT', `knownUserAccessed -> socket=${socket.id}`, data);
			if (!data?.id) return;
			user = data;
			const state = users.get(user.id) ?? { sockets: new Set(), lastSeen: Date.now() };
			state.sockets.add(socket.id);
			state.lastSeen = Date.now();
			users.set(user.id, state);
			socket.data.user = user;
			await markOnline(user);
			debug('STATE', `${user.username} sockets=${Array.from(state.sockets).join(', ')}`);
		});

		socket.on('userLogOut', async () => {
			debug('EVENT', `userLogOut -> ${user?.username}`);
			if (!user) return;
			const state = users.get(user.id);
			state?.sockets.delete(socket.id);
			await markOffline(user);
		});

		socket.on('bell', async (game, userId) => {
			debug('EVENT', `bell -> game=${game} userId=${userId}`);
			if (game === 'clear') {
				ringed = 0;
				debug('RING', 'Cleared all ring states.');
			} else if (game === 'vcnv') {
				io.to('sounds').emit('sound', 'bell_vcnv');
				await setRing(userId);
			} else if (ringed === 0) {
				ringed++;
				io.to('sounds').emit('sound', `bell_${game}`);
				await setRing(userId);
				debug('RING', `Bell triggered by ${userId} for ${game}`);
				await safe(() =>
					pb.collection('display_status').update('4T-DISPLAYSTATE', { bellAllowed: false })
				);
			} else {
				debug('RING', `Bell ignored - already ringed.`, game, userId, ringed);
			}
		});

		socket.on('message', (msg) => {
			debug('EVENT', `message -> ${msg}`);
			if (msg === 'joinSound') {
				socket.join('sounds');
				debug('JOIN', `Socket ${socket.id} joined room 'sounds'`);
			}
		});

		socket.on('soundReq', (sound) => {
			debug('EVENT', `soundReq -> ${sound}`);
			if (user && (user.username === 'user_kt_1' || [].includes(sound))) {
				io.to('sounds').emit('sound', sound);
				debug('EMIT', `Broadcasted sound '${sound}'`);
			}
		});

		socket.on('pingCheck', () => {
			debug('EVENT', `pingCheck from ${user?.username || socket.id}`);
			if (!user) return;
			const state = users.get(user.id);
			if (state) {
				state.lastSeen = Date.now();
				debug('HEARTBEAT', `Updated lastSeen for ${user.username}`);
			}
		});

		socket.on('disconnect', async () => {
			debug('SOCKET', `Disconnected: ${socket.id}`);
			if (!user) return;
			const state = users.get(user.id);
			if (!state) return;
			state.sockets.delete(socket.id);
			state.lastSeen = Date.now();
			debug('DISCONNECT', `${user.username} socket removed. Remaining: ${state.sockets.size}`);
			await markOffline(user);
		});
	});

	setInterval(async () => {
		debug('TICK', 'Running heartbeat check...');
		const now = Date.now();
		for (const [id, state] of users.entries()) {
			if (now - state.lastSeen > 30000 && state.sockets.size === 0) {
				debug('TIMEOUT', `User ${id} inactive for >30s. Marking offline.`);
				await markOffline({ id, collectionName: 'users', username: id, name: id });
			}
		}
	}, 10000);
}
