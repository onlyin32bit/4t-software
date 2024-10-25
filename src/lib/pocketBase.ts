import PocketBase, { type AuthModel } from 'pocketbase';
import { writable, type Writable } from 'svelte/store';
// import 'dotenv/config';

const PUBLIC_DB_ADDRESS = '192.168.2.8';
console.log(PUBLIC_DB_ADDRESS);

export const pb = new PocketBase('http://' + PUBLIC_DB_ADDRESS + ':8090');

export const user: Writable<AuthModel> = writable(pb.authStore.model ?? null, (set) => {
	pb.authStore.onChange(async () => {
		set(pb.authStore.model);
	});
});
