// import skio from 'sveltekit-io';
// import { browser } from '$app/environment';

// skio
// 	.setup(3000, {
// 		cors: {
// 			origin: 'http://localhost:4444',
// 			credentials: true
// 		}
// 	})
// 	.then((io) => {
// 		if (browser) return;
// 		io.on('connection', (socket) => {
// 			console.log(socket.id);
// 			socket.on('user', (user) => {
// 				console.log(user);
// 			});
// 		});
// 	});
