<script lang="ts">
	import { pb } from '$lib/pocketBase';
	import { onMount, onDestroy } from 'svelte';

	let users: any[] = [];
	let unsub: () => void;

	onMount(async () => {
		const userList = await pb.collection('users').getFullList();
		users = userList;
		// console.log(users);

		unsub = await pb.collection('users').subscribe('*', ({ action, record }) => {
			// console.log(record);
			if (action === 'update') {
				users = users.map((c) => {
					if (c.username === record.username) {
						return record;
					} else {
						return c;
					}
				});
			}
		});
	});

	onDestroy(() => {
		unsub?.();
	});
</script>

{#each users as user}
	<h1>{user.name}: {user.answer.toUpperCase()}: {user.score}</h1>
{/each}
