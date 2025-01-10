<script lang="ts">
	import { cubicOut } from 'svelte/easing';
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
		contestants.sort((a, b) => (a.time > b.time ? 1 : -1));

		// const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		// screen = displayStatus.screen;
		sendSoundRequest('tt_show_answer');

		unsub = [
			await pb.collection('users').subscribe('*', ({ action, record }) => {
				if (action === 'update') {
					contestants = contestants.map((currentValue) =>
						currentValue.id === record.id ? record : currentValue
					);
				}
			}),
			await pb.collection('display_status').subscribe('*', ({ action, record }) => {
				if (action === 'update' && record.screen !== 'answers_tt')
					goto('/display/' + record.screen);
			})
		];
		contestants.forEach(async ({ id, answer }) => {
			await pb.collection('users').update(id, { wrong: false });
		});
		setTimeout(() => {
			contestants.forEach(async ({ id, answer }, index) => {
				if (!answer) contestants[index].wrong = true;
			});
		}, 1900);
	});
	onDestroy(() => unsub.forEach((currentValue) => currentValue?.()));
</script>

<!-- main display -->
<div class="h-screen w-screen bg-bg-1 bg-cover bg-no-repeat text-[8vh] text-white">
	<img class="center-element fixed h-[50vh] opacity-25" src={logo} alt="Logo 4T" in:fade />
	<div
		class="fixed left-[23vw] top-1/2 h-[110vh] w-[3vw] -translate-y-1/2 bg-white"
		in:fly={{ y: -1300, duration: 1300, opacity: 1 }}
	></div>
	<div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-[3vh]">
		{#each contestants as { name, answer, time, wrong }, index (index)}
			<div>
				<div
					class="flex min-w-[65vw] flex-col border-[0.7vh] bg-gradient-to-tr from-[#0F247D] to-[#26164D]"
					style={`filter: brightness(${wrong ? '0.65' : '1.1'}) drop-shadow(8px 28px 32px #335);`}
					in:fly|global={{ x: 500, delay: index * 305, easing: cubicOut }}
				>
					<div class="z-50 text-[5vh] font-black text-black">
						<div
							class="w-[25vw] bg-white px-[2vw]"
							style={`clip-path: polygon(100% 0, 100% 65%, 92% 100%, 0 100%, 0 0);`}
						>
							{name}
						</div>
					</div>
					<div
						class="z-50 flex h-[9vh] min-w-[40vw] items-center px-[2vw]"
						in:slide={{ delay: 1500, duration: 600 }}
					>
						<span class="mr-[2vw] text-[7vh] font-bold tracking-tighter">
							{answer.toUpperCase()}
						</span>
						<span class="font-mono ml-auto font-medium tracking-tighter"
							>{(time / 1000).toFixed(2)}</span
						>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
