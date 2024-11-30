<script lang="ts">
	import { pb } from '$lib/pocketBase';
	import { socket } from '$lib/socket.io-client';
	import { playSound, soundsCollection } from '$lib/utils';
	import { Howl } from 'howler';
	import { onDestroy, onMount } from 'svelte';
	let soundAllowed: boolean = false;

	const soundSelectionList: Array<string> = [
		'tong_ket_diem',
		'space',
		'kd_start',
		'kd_start_2',
		'kd_start_question',
		'kd_time',
		'kd_correct',
		'kd_wrong',
		'kd_end'
	];
	let selectedSound: string;

	let sound: string = '';

	let audio: Howl;

	let unsub: () => void;
	onMount(() => {
		// const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		// sound = displayStatus.sound;
		// unsub = await pb
		// 	.collection('display_status')
		// 	.subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
		// 		if (action === 'update') {
		// 			if (sound !== '' || sound !== record.sound) {
		// 				sound = record.sound;
		// 				// playSound(record.sound);
		// 				// audio.stop();
		// 				audio = new Howl({
		// 					src: ['src/lib/sound/' + (soundsCollection.get(sound) ?? '')],
		// 					volume: 1
		// 				});
		// 				// audio.once('load', () => {
		// 				audio.play();
		// 				// });
		// 				// audio.on('end', async () => {
		// 				// 	await pb.collection('display_status').update('4T-DISPLAYSTATE', {
		// 				// 		sound: ''
		// 				// 	});
		// 				// });
		// 			}
		// 		}
		// 	});
		socket.on('sound', (sound) => {
			playSound(sound);
		});
	});

	onDestroy(() => {
		unsub?.();
	});
</script>

{#if !soundAllowed}
	<div class="flex h-screen items-center justify-center">
		<button
			class="btn"
			on:click={() => {
				soundAllowed = true;
			}}>CLICK TO ALLOW SOUNDS</button
		>
	</div>
{:else}
	<div>
		<h1 class="text-6xl">SOUND ALLOWED</h1>
		<select class="select select-bordered select-lg" bind:value={selectedSound}>
			{#each soundSelectionList as sound}
				<option value={sound}>{sound}</option>
			{/each}
		</select>
		<button
			class="btn btn-lg"
			on:click={() => {
				playSound(selectedSound);
			}}>TEST</button
		>
	</div>
{/if}
