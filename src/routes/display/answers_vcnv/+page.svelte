<script lang="ts">
	import logo from '$lib/image/4t.png';
	import { fly, fade, slide, scale } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';
	import type { RecordModel } from 'pocketbase';
	import { sendSoundRequest } from '$lib/utils';

	let contestants: RecordModel[] = [];

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
		contestants.forEach(async ({ id }) => {
			await pb.collection('users').update(id, { wrong: false });
		});
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
	{#each contestants as { name, wrong, answer }, index}
		{#if index % 2 === 0}
			<div
				class="fixed"
				style={`left: 52vw; top: ${20 * (index + 0.5)}vh; filter: brightness(${wrong ? '0.65' : '1.1'});`}
			>
				<div
					class="flex min-w-[40vw] flex-col border-[0.7vh] bg-gradient-to-tr from-[#0F247D] to-[#26164D]"
					in:fly|global={{ x: -100, y: -50, delay: index * 200, duration: 500 }}
				>
					<h1 class="text-[5vh] font-black text-black">
						<div
							class="w-[25vw] bg-white px-[2vw]"
							style={`clip-path: polygon(100% 0, 100% 65%, 92% 100%, 0 100%, 0 0);`}
						>
							{name}
						</div>
					</h1>
					<div
						class="flex h-[9vh] min-w-[40vw] items-center px-[2vw] text-[7vh] font-bold tracking-tighter"
						in:slide={{ delay: 1500, duration: 600 }}
					>
						<!-- <span > -->
						{answer.toUpperCase()}
						<!-- </span> -->
					</div>
				</div>
			</div>
		{:else}
			<div
				class="fixed"
				style={`right: 52vw; top: ${20 * (index + 0.5)}vh; filter: brightness(${wrong ? '0.65' : '1.1'}) drop-shadow(8px 28px 32px #335);`}
			>
				<div
					class="flex min-w-[40vw] flex-col items-end border-[0.7vh] bg-gradient-to-tr from-[#0F247D] to-[#26164D]"
					in:fly|global={{ x: 100, y: -50, delay: index * 180, duration: 500 }}
				>
					<h1 class="text-right text-[5vh] font-black text-black">
						<div
							class="w-[25vw] bg-white px-[2vw]"
							style={`clip-path: polygon(100% 0, 100% 100%, 8% 100%, 0 65%, 0 0);`}
						>
							{name}
						</div>
					</h1>
					<div
						class="flex h-[9vh] min-w-[40vw] items-center justify-end px-[2vw] text-[7vh] font-bold tracking-tighter"
						in:slide={{ delay: 1500, duration: 600 }}
					>
						{answer.toUpperCase()}
					</div>
				</div>
			</div>
		{/if}
	{/each}
</div>
