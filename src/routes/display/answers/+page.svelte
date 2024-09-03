<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';

	let contestants: any[] = [];
	let status: string = 'answers';
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
				status = record.screen;
			}
		});
	});

	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	$: if (status != 'answers') {
		goto('/display/' + status);
	}
</script>

<!-- main display -->
<div class="flex flex-col items-center justify-center text-[5rem] font-[600] text-white">
	<h1 class="text-[8rem]">TỨ KẾT 4</h1>
	{#each contestants as contestant}
		<div>
			<h1>{contestant.name}</h1>
			<div>
				<span>{contestant.time}</span>
				<p>{contestant.answer}</p>
			</div>
		</div>
	{/each}
</div>
