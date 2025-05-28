<script lang="ts">
	import { pb } from '$lib/pocketBase';
	import { onMount, onDestroy } from 'svelte';
	import { sendSoundRequest, timerSettings } from '$lib/utils';
	import type { RecordModel } from 'pocketbase';
	import { slide, scale, fade } from 'svelte/transition';
	import { tweened } from 'svelte/motion';

	export let questionNumber: number;
	export let questionContent: string;
	export let questionType: string;
	export let questionFile: string;
	export let displayQuestion: boolean = false;
	export let contestants: RecordModel[] = [];
	export let currentContestantTurn: number = -1;

	onMount(async () => {
		sendSoundRequest('kd_start_2');
		setTimeout(() => {
			sendSoundRequest('kd_start_question');
		}, 4500);

		await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
			if (action === 'update') {
				if (record.timer === -1) {
					if ($time !== 3) {
						time.set(0, { duration: 0 });
						timeStatus = false;
					}
				} else {
					time.set(0, { duration: 0 });
					timeStatus = true;
					timer();
				}
			}
		});
	});
	onDestroy(() => pb.collection('display_status').unsubscribe('4T-DISPLAYSTATE'));

	let time = tweened(0, { duration: 3000 });
	// let stopTimer = false;
	let timeStatus: boolean = false;

	function timer() {
		$time = 3;
	}

	$: if (questionNumber > 1) {
		// stopTimer = true;
		displayQuestion = false;
		setTimeout(() => {
			displayQuestion = true;
		}, 500);
		timeStatus = false;
		time.set(0, { duration: 0 });
		fontSize = 6;
	}

	let containerHeight: number;
	let textHeight: number;
	let fontSize: number = 6;

	function calcPercent(x: number, y: number): number {
		return (x / y) * 100;
	}

	$: if (calcPercent(textHeight, containerHeight) < 50) {
		fontSize += 0.2;
	} else if (calcPercent(textHeight, containerHeight) > 80) {
		fontSize -= 0.5;
	}
</script>

<div class="fixed w-full h-full bg-no-repeat bg-cover bg-bg-2">
	<div
		class="fixed left-[1vw] top-[17vh] h-[65vh] w-[80vw] font-semibold"
		bind:clientHeight={containerHeight}
	>
		<img
			class="absolute top-[-10vh] w-[80vw]"
			style={`filter: drop-shadow(8px 28px 32px #335);`}
			src="/src/lib/image/bg-ques.svg"
			alt="BG"
			in:scale={{ duration: 3000 }}
		/>
		<div
			class="absolute left-[4vw] top-[-1vh] flex h-[10vh] w-[8vw] items-center justify-center bg-white font-number-display text-[8vh] font-extrabold text-black"
			style="clip-path: polygon(100% 0, 100% 70%, 80% 100%, 0 100%, 0 0);"
			in:slide|local={{ delay: 4500, duration: 1200 }}
			class:invisible={!questionContent}
		>
			{questionNumber}
		</div>
		{#if questionType === 'image'}
			<div class:invisible={!displayQuestion}>
				<div class="absolute left-1/2 w-[55vw] -translate-x-[45%] whitespace-pre-line text-[4.2vh]">
					{questionContent}
				</div>
				<img
					class="absolute left-1/2 top-[15vh] h-[50vh] -translate-x-1/2"
					src={questionFile}
					alt=""
				/>
			</div>
		{:else}
			<div
				class="absolute left-1/2 top-1/2 z-50 w-[65vw] -translate-x-1/2 -translate-y-1/2 text-left"
				class:text-center={!questionContent}
				style={`font-size: ${fontSize}vh;`}
				bind:clientHeight={textHeight}
			>
				<div class="whitespace-pre-line" class:invisible={!displayQuestion}>
					{questionContent ? questionContent : 'KẾT THÚC'}
				</div>
			</div>
		{/if}
	</div>

	<div class="fixed right-[2vw] top-[26vh] space-y-[3vh] text-[4vh] font-medium">
		{#each contestants as contestant, i}
			<div
				class="flex w-[18vw] items-center justify-between bg-gradient-to-tr from-[#093278] to-[#093278] px-[1vw]"
				style={`border: 0.5vh solid #6EB0ED; filter: drop-shadow(8px 8px 17px #335) brightness(${contestant.ring > 0 || i === currentContestantTurn ? '1.0' : '0.4'});`}
			>
				<div>{contestant.name}</div>
				<!-- <div class="font-mono font-semibold filter-none">{contestant.score}</div> -->
			</div>
		{/each}
	</div>
	<div
		class="fixed bottom-[12.5vh] right-[2vw] h-[21.5vh] w-[18vw] rounded-[1vh] bg-cover bg-no-repeat backdrop-blur"
		style={`border: 0.7vh solid #6EB0ED; filter: drop-shadow(8px 28px 32px #335); background: conic-gradient(red, ${$time / 3}turn, rgba(256,256,256,0.2), ${$time / 3 + 0.05}turn, rgba(256,256,256,0.2));`}
		in:scale={{ duration: 3000 }}
	>
		<div
			class="center-element absolute flex h-[18vh] w-[16vw] items-center justify-center rounded-[1vh] bg-gradient-to-tr from-[#093278] to-[#093278] text-[13vh] font-bold"
		>
			{timeStatus ? (3 - $time).toFixed(0) : ''}
		</div>
	</div>
	<!-- <div class="fixed top-0 left-0 text-4xl font-black">{questionFile}</div> -->
</div>
