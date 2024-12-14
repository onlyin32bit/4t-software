<script lang="ts">
	import logo from '$lib/image/4t.png';
	import { fly, fade, slide, scale } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';
	import type { RecordModel } from 'pocketbase';
	import { sendSoundRequest } from '$lib/utils';

	let contestants: RecordModel[] = [];
	let screen: string;

	let unsub: (() => void)[] = [];
	onMount(async () => {
		const userList = await pb.collection('users').getFullList();
		contestants = userList;
		contestants.sort((a, b) => (a.answer ? (b.answer ? 0 : -1) : 1));

		sendSoundRequest('vcnv_show_answer');

		unsub = [
			await pb.collection('users').subscribe('*', ({ action, record }) => {
				if (action === 'update') {
					contestants = contestants.map((currentValue) =>
						currentValue.id === record.id ? record : currentValue
					);
				}
			}),
			await pb.collection('display_status').subscribe('*', ({ action, record }) => {
				if (action === 'update' && record.screen !== 'answers_vcnv')
					goto('/display/' + record.screen);
			})
		];
	});
	onDestroy(() => unsub.forEach((currentValue) => currentValue?.()));
</script>

<!-- main display -->
<div class="h-screen w-screen bg-bg-1 bg-cover bg-no-repeat text-[8vh] text-white">
	<img class="center-element fixed h-[50vh] opacity-25" src={logo} alt="Logo 4T" in:fade />
	<div
		class="fixed left-1/2 top-1/2 h-[110vh] w-[2vw] -translate-x-1/2 -translate-y-1/2 bg-white"
		in:fly={{ y: -1300, delay: 200, duration: 900 }}
	></div>
	{#each contestants as contestant, i}
		{#if i % 2 === 0}
			<div class="fixed" style={`left: 52vw; top: ${20 * (i + 0.5)}vh`}>
				<div
					class="flex min-w-[38vw] flex-col border-[0.7vh] bg-gradient-to-tr from-[#0F247D] to-[#26164D] px-[1.5vw]"
					in:fly|global={{ x: -100, y: -50, delay: i * 200, duration: 500 }}
				>
					<h1 class="text-[5vh] font-semibold">{contestant.name}</h1>
					<div
						class="flex h-[9vh] min-w-[40vw] items-center text-[7vh] font-bold tracking-tighter"
						in:slide={{ delay: 1500, duration: 600 }}
					>
						<!-- <span > -->
						{contestant.answer.toUpperCase()}
						<!-- </span> -->
					</div>
				</div>
			</div>
		{:else}
			<div class="fixed" style={`right: 52vw; top: ${20 * (i + 0.5)}vh;`}>
				<div
					class="flex min-w-[38vw] flex-col items-end border-[0.7vh] bg-gradient-to-tr from-[#0F247D] to-[#26164D] px-[1.5vw]"
					in:fly|global={{ x: 100, y: -50, delay: i * 180, duration: 500 }}
				>
					<h1 class="text-[5vh] font-semibold">{contestant.name}</h1>
					<div
						class="flex h-[9vh] min-w-[40vw] items-center justify-end text-[7vh] font-bold tracking-tighter"
						in:slide={{ delay: 1500, duration: 600 }}
					>
						{contestant.answer.toUpperCase()}
					</div>
				</div>
			</div>
		{/if}
	{/each}
</div>
