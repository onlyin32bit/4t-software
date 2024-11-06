<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';

	let contestants: any[] = [];
	let status: string = 'answers';
	let unsub: (() => void)[] = [];

	onMount(async () => {
		const userList = await pb.collection('users').getFullList();
		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');

		contestants = userList;
		status = displayStatus.screen;

		unsub[0] = await pb.collection('users').subscribe('*', ({ action, record }) => {
			// console.log(record);
			if (action === 'update') {
				contestants = contestants.map((currentValue) =>
					currentValue.id === record.id ? record : currentValue
				);
			}
		});
		unsub[1] = await pb.collection('display_status').subscribe('*', ({ action, record }) => {
			if (action === 'update') status = record.screen;
		});
	});

	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	$: if (status != 'answers') goto('/display/' + status);
</script>

<!-- main display -->
<div
	class="flex h-screen w-screen items-center justify-center bg-bg-1 bg-cover bg-no-repeat text-[8vh] text-white"
>
	<div>
		{#each contestants as contestant, i}
			<div class="flex flex-col" in:fly={{ x: 200, delay: i * 100 }}>
				<h1 class="text-[6vh]">{contestant.name}</h1>
				<div class="flex min-w-[40vw] items-center" in:fade={{ duration: 1000 }}>
					<p class="mr-[2vw] inline font-semibold tracking-tighter">
						{contestant.answer.toUpperCase()}
					</p>
					<span class="ml-auto font-medium tracking-tighter"
						>{(contestant.time / 1000).toFixed(2)}</span
					>
				</div>
			</div>
		{/each}
	</div>
</div>
