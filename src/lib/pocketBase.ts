import PocketBase, { type AuthModel } from 'pocketbase';
import { writable, type Writable } from 'svelte/store';

// const DB_ADDRESS = process.env.PUBLIC_DB_ADDRESS;
const DB_ADDRESS = '192.168.1.1';
// const DB_ADDRESS = '192.168.110.115';
// const DB_ADDRESS = '127.0.0.1';

export const pb = new PocketBase(`http://${DB_ADDRESS}:8090`);
pb.autoCancellation(false);

export const user: Writable<AuthModel> = writable(pb.authStore.model, (set) => {
	pb.authStore.onChange(async () => {
		set(pb.authStore.model);
	});
});
