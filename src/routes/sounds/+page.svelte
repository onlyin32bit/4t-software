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

	// let sound: string = '';

	let timerAudioList: Howl[] = [];
	let backgroundAudioSound: Howl;

	onMount(() => {
		socket.on('sound', (sound: string) => {
			if (sound === 'kd_bg_music') {
				backgroundAudioSound = new Howl({
					src: ['src/lib/sound/' + (soundsCollection.get(sound) ?? '')],
					volume: 1,
					loop: true
				});
				backgroundAudioSound.play();
			} else if (sound.startsWith('stop')) {
				if (sound.endsWith('bg_music')) {
					backgroundAudioSound.fade(1, 0, 700);
				} else if (sound.endsWith('timer')) {
					timerAudioList.at(-1)?.stop();
					timerAudioList.at(-2)?.stop();
				}
			} else if (sound.startsWith('media:')) {
				const media = new Howl({
					src: [sound.slice(6)],
					volume: 1.5
				});
				media.play();
			} else if (sound.includes('time')) {
				timerAudioList = [
					...timerAudioList,
					new Howl({
						src: ['src/lib/sound/' + (soundsCollection.get(sound) ?? '')],
						volume: 1
					})
				];
				timerAudioList.at(-1)?.play();
				timerAudioList.at(-2)?.stop();
				if (timerAudioList.length > 2) timerAudioList.splice(0, 1);
			} else {
				playSound(sound);
			}
			console.log(sound);
		});
	});

	onDestroy(() => {});
</script>

{#if !soundAllowed}
	<div class="flex h-screen items-center justify-center">
		<button
			class="btn"
			on:click={() => {
				soundAllowed = true;
				socket.emit('message', 'joinSound');
				console.log('JOINED SOUND ROOM');
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
