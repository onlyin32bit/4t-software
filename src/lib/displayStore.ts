import { pb } from './pocketBase';
import type { RecordModel } from 'pocketbase';
import { readable } from 'svelte/store';

export const display = readable<RecordModel | null>(null, (set) => {
	pb.collection('display_status').subscribe('*', ({ action, record }) => {
		if (action === 'update') {
			set(record);
		}
	});
	// return () => pb.collection('display_status').unsubscribe('4T-DISPLAYSTATE');
});
