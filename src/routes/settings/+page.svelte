<script lang="ts">
	import { pb } from '$lib/pocketBase';
	import { onMount } from 'svelte';
	import { Toaster, toast } from 'svelte-sonner';

	let season: number;
	let game: string;
	let gameNumber: number;

	onMount(async () => {
		const settingsRecord = await pb.collection('settings').getOne('GLOBAL-SETTINGS');
		console.log(settingsRecord);

		season = settingsRecord.field.season;
		game = settingsRecord.field.game;
		gameNumber = settingsRecord.field.game_number;
	});

	async function applySettings() {
		await pb.collection('settings').update('GLOBAL-SETTINGS', {
			field: { season: season, game: game, game_number: gameNumber }
		});
		toast.success('Applied');
	}
</script>

<Toaster />

<a href="/" class="link-hover">Home</a>
<br />
<select class="select select-bordered" bind:value={game}>
	<option value="tk">TU KET</option>
	<option value="bk">BAN KET</option>
	<option value="ck">CHUNG KET</option>
</select>
<input class="input input-bordered" type="number" bind:value={gameNumber} />
<button class="btn" on:click={applySettings}>Apply</button>
<div>InDev</div>
