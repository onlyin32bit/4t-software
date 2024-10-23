<script lang="ts">
	import { pb } from '$lib/pocketBase';
	import { onMount, onDestroy } from 'svelte';

	let contestants: any[] = [];
	let unsub: (() => void)[] = [];

	onMount(async () => {
		const userList = await pb.collection('users').getFullList();
		contestants = userList;

		unsub[0] = await pb.collection('users').subscribe('*', ({ action, record }) => {
			if (action === 'update') {
				contestants = contestants.map((currentValue) => {
					if (currentValue.username === record.username) return record;
					else return currentValue;
				});
			}
		});
	});

	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});
</script>

{#each contestants as user}
	<h1>{user.name}: {user.answer.toUpperCase()}: {user.score}</h1>
{/each}
<div class="h-screen w-screen"></div>
