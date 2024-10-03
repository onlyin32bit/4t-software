import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';
import { PUBLIC_DB_ADDRESS } from '$env/static/public';

export const pb = new PocketBase('http://' + PUBLIC_DB_ADDRESS + ':8090');

export const user = writable(pb.authStore.model, (set) => {
	pb.authStore.onChange(async () => {
		set(pb.authStore.model);
	});
});
