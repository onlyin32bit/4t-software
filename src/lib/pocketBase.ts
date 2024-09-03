import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';
import { PUBLIC_DB_ADDRESS } from '$env/static/public';

export const pb = new PocketBase('http://' + PUBLIC_DB_ADDRESS + ':8090');

function userStore() {
	let unsubscribe: () => void;

	// if (!auth || !globalThis.window) {
	// 	console.warn('Error Auth');
	// 	const { subscribe } = writable(null);
	// 	return {
	// 		subscribe
	// 	};
	// }
	const { subscribe } = writable(pb.authStore.model ?? null, (set) => {
		unsubscribe = pb.authStore.onChange(() => {
			console.log('logged in');
			set(pb.authStore.model);
		});

		return () => unsubscribe();
	});
	return { subscribe };
}
export const user = userStore();
