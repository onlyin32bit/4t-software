<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { dictionary } from '$lib/utils';
	import { onDestroy, onMount } from 'svelte';

	let contestants: any[] = [];
	let status: string = 'main';
	let settings: { game: string; game_number: number } = { game: '', game_number: -1 };
	let unsub: (() => void)[] = [];

	onMount(async () => {
		const userList = await pb.collection('users').getFullList();
		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		const settingsRecord = await pb.collection('settings').getOne('GLOBAL-SETTINGS');

		contestants = userList;
		status = displayStatus.screen;
		settings = {
			game: settingsRecord.field.game,
			game_number: settingsRecord.field.game_number
		};
		// console.log(status);

		// unsub[0] = await pb.collection('users').subscribe('*', ({ action, record }) => {
		// 	// console.log(record);
		// 	if (action === 'update') {
		// 		contestants = contestants.map((currentValue) =>
		// 			currentValue.id === record.id ? record : currentValue
		// 		);
		// 	}
		// });
		unsub = [
			await pb.collection('display_status').subscribe('*', ({ action, record }) => {
				if (action === 'update') {
					status = record.screen;
				}
			})
		];
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

<div
	class="pointer-events-none flex h-screen w-screen select-none flex-col items-center justify-center gap-[4vh] bg-bg-1 bg-cover bg-no-repeat text-[8vh] font-semibold tracking-wide text-white"
>
	<img class="fixed left-[2vw] top-[3vh] h-[15vh]" src="/src/lib/image/4t.png" alt="Logo 4T" />
	<img
		class="fixed right-[2vw] top-[5vh] h-[18vh]"
		src="/src/lib/image/logo-cbt.png"
		alt="Logo THPT Chuyen Ben Tre"
	/>
	{#if settings.game !== ''}
		<h1 class="text-[14vh] font-semibold uppercase text-blue-100" in:scale>
			{`${dictionary.get(settings.game) ?? '...'} ${settings.game === 'ck' ? '' : settings.game_number}`}
		</h1>
	{/if}
	<table class="scale-95">
		<tbody>
			{#each contestants as contestant, i}
				<div in:fade={{ delay: (i + 1) * 100 }}>
					{#if i > 0}
						<tr>
							<td class="h-[5vh]"></td>
						</tr>
					{/if}
					<tr class="h-[14vh] shadow-lg">
						<td class="w-[45vw] bg-black text-center">{contestant.name.toUpperCase()}</td>
						<td class="w-[31vw] bg-gradient-to-b from-red-600 to-red-800 pl-[2vw]"
							>{contestant.class.toUpperCase()}</td
						>
					</tr>
				</div>
			{/each}
		</tbody>
	</table>
</div>
