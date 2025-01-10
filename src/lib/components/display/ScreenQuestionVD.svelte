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
	export let questionScore: string;
	export let displayQuestion: boolean = false;
	export let starStatus: boolean = false;
	export let contestants: RecordModel[] = [];
	export let currentContestantTurn: number = -1;
	export let currentRingedContestant: number = -1;

	const timePreset: { [key: string]: number } = {
		20: 15,
		30: 20
	};

	onMount(async () => {
		sendSoundRequest('vd_choose_package');

		await pb
			.collection('display_status')
			.subscribe('4T-DISPLAYSTATE', async ({ action, record }) => {
				if (action === 'update') {
					if (record.timer === -1) {
						if (!displayQuestion) {
							timeStatus = false;
							time.set(0, { duration: 0 });
						}
					} else if (record.timer === 5) {
						for (let time = 0; time < 2; time++) {
							for (let index = 0; index < 4; index++) {
								if (currentContestantTurn !== index) {
									if (currentRingedContestant > -1) {
										currentHightlight = currentRingedContestant;
										await new Promise((resolve) => setTimeout(resolve, 1500));
										console.log('asdadsdads');

										currentHightlight = -1;
										break;
									} else {
										currentHightlight = index;
										await new Promise((resolve) => setTimeout(resolve, 833));
									}
								}
							}
							currentHightlight = -1;
						}
					} else {
						time.set(0, { duration: 0 });
						timeStatus = true;
						timer(timePreset[questionScore]);
					}
				}
			});
	});
	onDestroy(() => pb.collection('display_status').unsubscribe('4T-DISPLAYSTATE'));

	let time = tweened(0, { duration: 0 });
	let timeStatus: boolean = false;
	// let fiveSecStatus: boolean = false;
	let currentHightlight: number = -1;

	async function timer(settedTime: number) {
		time.set(settedTime, { duration: settedTime * 1000 });
	}

	$: if (questionNumber > 1) {
		displayQuestion = false;
		timeStatus = false;
		// fiveSecStatus = false;
		fontSize = 6;
		time.set(0, { duration: 0 });
	}

	$: if (questionType === 'audio' && questionFile)
		pb.collection('display_status').update('4T-DISPLAYSTATE', {
			mediaToPlay: questionFile
		});

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

<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat">
	<div class="left-[1vw] top-[17vh] h-[65vh] w-[80vw]" bind:clientHeight={containerHeight}>
		<img
			class="absolute top-[-10vh] w-[80vw]"
			style={`filter: drop-shadow(8px 28px 32px #335);`}
			src="/src/lib/image/bg-ques.svg"
			alt="BG"
			in:scale={{ duration: 3000 }}
		/>
		<div
			class="absolute left-[3.9vw] top-[-1.2vh] flex h-[8vh] items-center justify-center bg-white px-[2vw] font-number-display text-[6.5vh] font-extrabold text-black"
			style="clip-path: polygon(100% 0, 100% 65%, 94% 100%, 0 100%, 0 0);"
			in:slide={{ delay: 3000, duration: 1200 }}
		>
			{contestants[currentContestantTurn].name}
		</div>
		<div
			class="absolute left-1/2 top-1/2 z-50 w-[65vw] -translate-x-1/2 -translate-y-1/2 text-left font-semibold"
			class:text-center={!questionContent}
			style={`font-size: ${fontSize}vh;`}
			bind:clientHeight={textHeight}
		>
			<div class="whitespace-pre-line" class:invisible={!displayQuestion}>
				{questionContent === undefined ? 'KẾT THÚC' : questionContent}
			</div>
		</div>
	</div>

	<div
		class="fixed right-[2vw] top-[26vh] space-y-[3vh] text-[4vh] font-semibold"
		in:fade={{ duration: 1000 }}
	>
		{#each contestants as { name, ring }, contestantIndex}
			{#if contestantIndex !== currentContestantTurn}
				<div
					style={`filter: drop-shadow(8px 8px 17px #335); ${currentHightlight === contestantIndex ? 'outline: 0.7vh solid #fff; box-shadow: 0 0 1vh 1vh #fff' : ''}`}
				>
					<div
						class="flex w-[18vw] items-center justify-between bg-gradient-to-tr from-[#093278] to-[#093278] px-[1vw]"
						style={`border: 0.6vh solid #6EB0ED; filter: brightness(${ring > 0 || contestantIndex === currentContestantTurn ? '1.0' : '0.3'}); `}
					>
						<div>{name}</div>
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<div class="fixed bottom-[12.5vh] right-[2vw] space-y-[2vh]" in:scale={{ duration: 3000 }}>
		<div
			class="flex h-[8vh] w-[18vw] items-center justify-center rounded-[1vh] bg-gradient-to-tr from-[#093278] to-[#093278] text-[4.5vh] font-bold transition-colors duration-500"
			style={`border: 0.7vh solid #${starStatus ? 'ff5' : '6EB0ED'}; filter: drop-shadow(8px 28px 32px #335);`}
		>
			{`Câu ${questionScore} điểm`}
		</div>
		<div
			class="h-[21.5vh] w-[18vw] rounded-[1vh] bg-cover bg-no-repeat backdrop-blur"
			style={`border: 0.7vh solid #6EB0ED; filter: drop-shadow(8px 28px 32px #335); background: conic-gradient(red, ${$time / timePreset[questionScore]}turn, rgba(256,256,256,0.2), ${$time / timePreset[questionScore] + 0.05}turn, rgba(256,256,256,0.2));`}
		>
			<div
				class="center-element absolute flex h-[18vh] w-[16vw] items-center justify-center rounded-[1vh] bg-gradient-to-tr from-[#093278] to-[#093278] text-[14vh] font-bold"
			>
				{timeStatus
					? (timePreset[questionScore] - $time).toFixed(0)
					: displayQuestion
						? timePreset[questionScore]
						: ''}
			</div>
		</div>
	</div>
	{#if starStatus}
		<img
			class="fixed right-[18vw] top-[-5vh] h-[47vh]"
			src="/src/lib/image/stars/Star_4T_1.gif"
			alt="Star"
			in:scale
		/>
	{/if}
	<!-- <div class="fixed left-0 top-0 text-4xl font-black">
		{questionFile}
		{timeStatus}
		{displayQuestion}
		{currentRingedContestant}
	</div> -->
</div>
