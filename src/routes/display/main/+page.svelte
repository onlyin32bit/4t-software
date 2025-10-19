<script lang="ts">
	import { fly, scale, fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { dictionary } from '$lib/utils';
	import { onDestroy, onMount } from 'svelte';
	import type { RecordModel } from 'pocketbase';

	let contestants: RecordModel[] = [];
	let settings: { game: string; game_number: number } = { game: '', game_number: -1 };

	let unsub: (() => void)[] = [];
	onMount(async () => {
		const userList = await pb.collection('users').getFullList();
		contestants = userList;

		const settingsRecord = await pb.collection('settings').getOne('GLOBAL-SETTINGS');
		settings = {
			game: settingsRecord.field.game,
			game_number: settingsRecord.field.game_number
		};

		unsub = [
			await pb.collection('display_status').subscribe('*', ({ action, record }) => {
				if (action === 'update' && record.screen !== 'main') goto('/display/' + record.screen);
			})
		];
	});
	onDestroy(() => unsub.forEach((currentValue) => currentValue?.()));
</script>

<div
	class="pointer-events-none flex h-screen w-screen select-none bg-bg-2 bg-cover bg-no-repeat text-[8vh] font-semibold tracking-wide text-white"
>
	<img class="fixed left-[3vw] top-[5vh] h-[16vh]" src="/src/lib/image/4t.png" alt="Logo 4T" in:fade/>
	<img
		class="fixed right-[3vw] top-[5.5vh] h-[17vh]"
		src="/src/lib/image/logo-cbt.png"
		alt="Logo THPT Chuyen Ben Tre"
		in:fade
	/>
	{#if settings.game}
		<h1
			class="fixed left-0 top-[1.5vh] w-screen text-center font-number-display text-[17vh] font-bold uppercase text-blue-50"
			style={`text-shadow: 0.1vh 0.5vh 1vh rgba(103, 103, 140, 1);`}
			in:scale={{ duration: 700 }}
		>
			{`${dictionary.get(settings.game) ?? '...'} ${settings.game === 'ck' ? '' : settings.game_number}`}
		</h1>
	{/if}
	<div class="w-[80vw] fixed left-1/2 -translate-x-1/2 top-[28vh] flex flex-col  gap-[5.5vh]">
		{#each contestants as contestant, index (contestant.id)}
			<div
				class="flex items-center gap-[4vw] overflow-hidden rounded-[1vh]"
				style={`filter: drop-shadow(0.5vh 0.5vh 1vh #336); background: radial-gradient(circle, #033076 0%, #00244e 100%);`}
				in:fly={{ x: -200, delay: index * 200 }}
			>
				<div
					class="w-[43vw] bg-gradient-to-l from-[#00bfff] via-[#00fdff] to-[#00bfff] px-[3vw] font-number-display font-black text-[#003]"
					style={`clip-path: polygon(100% 0, 100% 65%, 92% 100%, 0 100%, 0 0);`}
				>
					{contestant.name}
				</div>
				<div class="font-header-text text-[6.7vh] text-[#00fdff]">
					{contestant.class}
				</div>
			</div>
		{/each}
	</div>
</div>
