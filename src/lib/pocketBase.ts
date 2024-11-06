import PocketBase, { type AuthModel } from 'pocketbase';
import { writable, type Writable } from 'svelte/store';
import { env } from '$env/dynamic/public';

const DB_ADDRESS = env.PUBLIC_DB_ADDRESS;

export const pb = new PocketBase('http://' + DB_ADDRESS + ':8090');

export const user: Writable<AuthModel> = writable(pb.authStore.model, (set) => {
	pb.authStore.onChange(async () => {
		set(pb.authStore.model);
	});
});
