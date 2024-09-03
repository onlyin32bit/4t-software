<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';

	let contestants: any[] = [];
	let status: string = 'main';
	let unsub: (() => void)[] = [];

	onMount(async () => {
		const userList = await pb.collection('users').getFullList();
		const displayStatus = await pb.collection('display_status').getOne('4t-displaystate');
		// console.log(displayStatus[0].action);

		contestants = userList;
		status = displayStatus.screen;
		// console.log(status);

		unsub[0] = await pb.collection('users').subscribe('*', ({ action, record }) => {
			// console.log(record);
			if (action === 'update') {
				contestants = contestants.map((currentValue) => {
					if (currentValue.username === record.username) {
						return record;
					} else {
						return currentValue;
					}
				});
			}
		});
		unsub[1] = await pb.collection('display_status').subscribe('*', ({ action, record }) => {
			if (action === 'update') {
				// console.log(record.action);
				status = record.screen;
			}
		});
	});

	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	$: if (status != 'main') {
		goto('/display/' + status);
	}
</script>

<!-- main display -->
<div class="flex flex-col items-center justify-center text-[5rem] font-[600] text-white">
	<h1 class="text-[8rem]">TỨ KẾT 4</h1>
	<table class="">
		<tbody>
			{#each contestants as contestant}
				<tr>
					<td class="h-16"></td>
				</tr>
				<tr class="h-[9rem]">
					<td class="w-[55rem] bg-black text-center">{contestant.name.toUpperCase()}</td>
					<td class="w-[30rem] bg-gradient-to-b from-red-700 to-red-950 px-10"
						>{contestant.class.toUpperCase()}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
