<script lang="ts">
	import { pb } from '$lib/pocketBase';
	import { onMount, onDestroy } from 'svelte';
	import { sendSoundRequest } from '$lib/utils';
	import type { RecordModel } from 'pocketbase';
	import { slide, scale, fade } from 'svelte/transition';

	export let questionNumber: number;
	export let questionContent: string;
	export let needBell: boolean = false;
	export let displayQuestion: boolean = false;
	export let contestants: RecordModel[] = [];

	onMount(async () => {
		sendSoundRequest('kd_start_2');

		await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
			if (action === 'update' && record.timer !== -1) timer();
		});
	});
	onDestroy(() => pb.collection('display_status').unsubscribe('4T-DISPLAYSTATE'));

	let time: number = 3;
	let timeStatus: boolean = false;

	async function timer() {
		time = 3;
		timeStatus = true;
		let countdown: any = setInterval(() => {
			time -= 0.01;
			if (time <= 0) {
				clearInterval(countdown);
				countdown = null;
				time = 0;
			}
		}, 10);
	}

	$: if (questionNumber > 1) {
		displayQuestion = false;
		setTimeout(() => {
			displayQuestion = true;
		}, 200);
		timeStatus = false;
		time = 3;
	}

	let containerHeight: number;
	let textHeight: number;
	let fontSize: number = 3;

	function calcPercent(x: number, y: number): number {
		return (x / y) * 100;
	}

	$: if (calcPercent(textHeight, containerHeight) < 45) {
		fontSize += 1.2;
	} else if (calcPercent(textHeight, containerHeight) > 65) {
		fontSize -= 0.5;
	}
</script>

<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat" in:slide>
	<div class="left-[1vw] top-[17vh] h-[65vh] w-[80vw]" bind:clientHeight={containerHeight}>
		<img
			class="absolute top-[-10vh] w-[80vw]"
			style={`filter: drop-shadow(8px 28px 32px #335);`}
			src="/src/lib/image/bg-ques.svg"
			alt="BG"
			in:scale={{ duration: 3000 }}
		/>
		<div
			class="absolute left-[4vw] top-[-1vh] flex h-[12vh] w-[10vw] items-center justify-center bg-white font-number-display text-[9vh] font-extrabold text-black"
			style="clip-path: polygon(100% 0, 100% 70%, 80% 100%, 0 100%, 0 0);"
			in:slide={{ delay: 3100, duration: 1200 }}
		>
			{questionNumber}
		</div>
		<div
			class="absolute left-1/2 top-1/2 z-50 w-[65vw] -translate-x-1/2 -translate-y-1/2 text-left font-semibold"
			style={`font-size: ${fontSize}vh;`}
			bind:clientHeight={textHeight}
		>
			<div class="whitespace-pre-line" class:invisible={!displayQuestion}>
				{questionContent}
			</div>
		</div>
	</div>

	<!-- {#if bellRingedContestant}
		<div
			class="fixed right-[2vw] top-[10vh] flex w-[14vw] flex-col items-center justify-center gap-[3vh] rounded-[2vh] bg-blue-300 bg-opacity-35 p-[2vh] text-center text-[6vh] font-bold uppercase backdrop-blur"
			in:fly={{ y: 50 }}
		>
			<svg
				class="h-[10vh] animate-wiggle"
				fill="#ffff00"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 448 512"
				><path
					d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
				/></svg
			>
			{bellRingedContestant}
		</div>
	{/if} -->
	{#if needBell}
		<div class="fixed right-[2vw] top-[12vh] space-y-[3vh] text-[4vh] font-medium">
			{#each contestants as contestant}
				<div
					class="flex w-[18vw] items-center justify-between bg-gradient-to-tr from-[#093278] to-[#093278] px-[1vw]"
					style={`border: 0.5vh solid #6EB0ED; filter: drop-shadow(8px 8px 17px #335) brightness(${contestant.ring > 0 ? '1.0' : '0.6'});`}
					in:fade
				>
					<div>{contestant.name}</div>
					<div class="font-mono font-semibold">{contestant.score}</div>
				</div>
			{/each}
		</div>
	{/if}
	<div
		class="fixed bottom-[12.5vh] right-[2.5vw] h-[21.5vh] w-[17vw] rounded-[1vh] bg-cover bg-no-repeat backdrop-blur"
		style={`border: 0.7vh solid #6EB0ED; filter: drop-shadow(8px 28px 32px #335); background: conic-gradient(red, ${1 - time / 3}turn, rgba(256,256,256,0.2), ${1.05 - time / 3 - (!time ? 0.05 : 0)}turn, rgba(256,256,256,0.2));`}
		in:scale={{ duration: 6000 }}
	>
		<!-- <div class="center-element absolute h-[21vh] w-[17vw] rounded-[1vh] bg-black"></div> -->
		<div
			class="center-element absolute flex h-[18vh] w-[15vw] items-center justify-center rounded-[1vh] bg-gradient-to-tr from-[#093278] to-[#093278] text-[13vh] font-bold"
		>
			{timeStatus ? time.toFixed(0) : ''}
		</div>
	</div>
</div>
