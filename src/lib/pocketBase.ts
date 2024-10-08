import PocketBase, { type AuthModel } from 'pocketbase';
import { writable, type Writable } from 'svelte/store';
import { PUBLIC_DB_ADDRESS } from '$env/static/public';

export const pb = new PocketBase('http://' + PUBLIC_DB_ADDRESS + ':8090');

export const user: Writable<AuthModel> = writable(pb.authStore.model, (set) => {
	pb.authStore.onChange(async () => {
		set(pb.authStore.model);
	});
});
