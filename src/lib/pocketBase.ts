import { PUBLIC_PB_ADDR } from '$env/static/public';
import PocketBase, { type AuthModel } from 'pocketbase';
import { writable, type Writable } from 'svelte/store';

export const pb = new PocketBase(`http://${PUBLIC_PB_ADDR}:8090`);
pb.autoCancellation(false);

export const user: Writable<AuthModel> = writable(pb.authStore.model, (set) => {
	pb.authStore.onChange(async () => {
		set(pb.authStore.model);
	});
});
