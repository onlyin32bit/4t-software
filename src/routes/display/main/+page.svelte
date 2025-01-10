<script lang="ts">
	import { fade, scale } from 'svelte/transition';
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
	<img class="fixed left-[3vw] top-[5vh] h-[16vh]" src="/src/lib/image/4t.png" alt="Logo 4T" />
	<img
		class="fixed right-[3vw] top-[5.5vh] h-[17vh]"
		src="/src/lib/image/logo-cbt.png"
		alt="Logo THPT Chuyen Ben Tre"
	/>
	{#if settings.game}
		<h1
			class="fixed left-0 top-[1.5vh] w-screen text-center font-number-display text-[17vh] font-bold uppercase text-blue-50"
			style={`text-shadow: 0.1vh 0.5vh 1vh rgba(103, 103, 140, 1);`}
			in:scale
		>
			{`${dictionary.get(settings.game) ?? '...'} ${settings.game === 'ck' ? '' : settings.game_number}`}
		</h1>
	{/if}
	<!-- <table class="left-1/2 w-screen scale-95 font-medium">
		<tbody>
			{#each contestants as contestant, i}
				<div class="" in:fade={{ delay: (i + 1) * 100 }}>
					{#if i > 0}
						<tr>
							<td class="h-[5vh]"></td>
						</tr>
					{/if}
					<tr class="h-[14vh] shadow-lg">
						<td class="w-[45vw] rounded-[2vh] bg-black text-center"
							>{contestant.name.toUpperCase()}</td
						>
						<td class="w-[31vw] rounded-[2vh] bg-gradient-to-b from-red-600 to-red-800 pl-[2vw]">
							{contestant.class.toUpperCase()}
						</td>
					</tr>
				</div>
			{/each}
		</tbody>
	</table> -->
	<div class=""></div>
</div>
