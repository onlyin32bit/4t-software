<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';
	import type { RecordModel } from 'pocketbase';

	let contestants: RecordModel[] = [];

	let unsub: (() => void)[] = [];
	onMount(async () => {
		const userList = await pb.collection('users').getFullList();
		contestants = userList;

		unsub = [
			await pb.collection('users').subscribe('*', ({ action, record }) => {
				if (action === 'update')
					contestants = contestants.map((currentValue) =>
						currentValue.id === record.id ? record : currentValue
					);
			}),
			await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
				if (action === 'update' && record.screen !== 'scores') goto('/display/' + record.screen);
			})
		];
	});
	onDestroy(() => unsub.forEach((currentValue) => currentValue?.()));
</script>

<!-- main display -->
<div class="h-screen w-screen bg-bg-1 bg-cover bg-no-repeat text-[6vh] text-white">
	<h1 class="fixed left-1/2 top-[15vh] -translate-x-1/2 text-[12vh] font-extrabold">BẢNG ĐIỂM</h1>
	<div class="fixed left-1/2 top-[42vh] flex -translate-x-1/2 gap-[3vw]">
		{#each contestants as contestant, i}
			<div
				class="flex w-[22vw] flex-col items-center justify-center border-[0.8vh] border-orange-400 bg-white text-blue-800"
				in:scale={{ delay: i * 100 }}
			>
				<h1 class="w-full bg-yellow-300 text-center font-semibold">{contestant.name}</h1>
				<div class="text-[18vh] font-bold" in:fade={{ duration: 1000 }}>
					{contestant.score}
				</div>
			</div>
		{/each}
	</div>
</div>
