<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';
	import { fade, slide, scale, fly } from 'svelte/transition';
	import logo from '$lib/image/4t.png';
	import { typewriter, zoomIn } from '$lib/transitions';
	import { getCurrentTime, sendSoundRequest } from '$lib/utils';
	import ScreenStart from '$lib/components/display/ScreenStart.svelte';
	import ScreenRule from '$lib/components/display/ScreenRule.svelte';
	import ScreenIntro from '$lib/components/display/ScreenIntro.svelte';

	let generalQuestions: string[] = [];
	let personalQuestions: string[][] = [[]];

	const contestantMap: Map<string, number> = new Map([
		['ques_ts1', 0],
		['ques_ts2', 1],
		['ques_ts3', 2],
		['ques_ts4', 3]
	]);

	let screen: string = 'kd';
	let scr_slide: string = 'start';
	let ques: number = 1;
	let time: number = 3;
	let timeStatus: boolean = false;
	let displayQuestion: boolean = false;
	let bellRingedContestant: string = '';

	let unsub: (() => void)[] = [];
	onMount(async () => {
		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		screen = displayStatus.screen;
		scr_slide = displayStatus.slide;
		ques = displayStatus.ques;

		const generalQuestionList = await pb.collection('kd').getOne('4T-QUESKD-CHUNG');
		const personalQuestionList = await pb.collection('kd').getOne('4T-QUESTS-RIENG');
		generalQuestions = generalQuestionList.question;
		personalQuestions = personalQuestionList.question as string[][];

		unsub[0] = await pb.collection('display_status').subscribe('*', ({ action, record }) => {
			if (action === 'update') {
				screen = record.screen;
				scr_slide = record.slide;
				if (ques !== record.ques) ques = record.ques;
				// if (displayQuestion !== record.displayQuestion) {
				displayQuestion = record.displayQuestion;
				if (record.timer !== -1) timer();
				if (scr_slide === 'rule') sendSoundRequest('kd_start');
				else if (scr_slide === 'intro') sendSoundRequest('kd_start_2');
			}
		});

		unsub[1] = await pb.collection('users').subscribe('*', ({ action, record }) => {
			if (action === 'update' && record.ring > 0 && bellRingedContestant !== '') {
				bellRingedContestant = record.name;
			}
		});
	});

	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	let containerHeight: number;
	let textHeight: number;
	let fontSize: number = 1;

	async function timer() {
		timeStatus = true;
		let countdown: any = setInterval(() => {
			time -= 1;
			if (time < 0) {
				clearInterval(countdown);
				countdown = null;
				timeStatus = false;
				time = 3;
			}
		}, 1000);
	}

	$: {
		ques;
		// time = 3;
		fontSize = 1;
		displayQuestion = false;
		setTimeout(() => {
			displayQuestion = true;
		}, 100);
		bellRingedContestant = '';
	}

	function calcPercent(x: number, y: number): number {
		return (x / y) * 100;
	}

	$: if (calcPercent(textHeight, containerHeight) < 40) {
		fontSize += 1.5;
	} else if (calcPercent(textHeight, containerHeight) > 65) {
		fontSize -= 1;
	}

	$: if (screen != 'kd') goto('/display/' + screen);
</script>

<svelte:head>
	<title>{screen}/{scr_slide}</title>
</svelte:head>

<div class="pointer-events-none h-screen w-screen select-none bg-black text-white">
	{#if scr_slide === 'start'}
		<ScreenStart />
	{:else if scr_slide === 'rule'}
		<ScreenRule screen="kd" />
	{:else if scr_slide === 'intro'}
		<ScreenIntro screen="kd" />
	{:else if scr_slide === 'main_kd'}
		<div class="fixed h-full w-full bg-bg-3 bg-cover bg-no-repeat"></div>
	{:else if scr_slide === 'ques_chung'}
		<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat px-[2vw]">
			<div
				class="fixed bottom-[7vh] h-[84vh] w-[80vw] rounded-[1vh] bg-slate-950 bg-bg-kd bg-contain bg-center bg-no-repeat"
				in:scale={{ duration: 7000 }}
				bind:clientHeight={containerHeight}
			>
				<div class="absolute left-[4.3vw] top-[6vh]">
					<img class="h-[11vh] scale-x-[130%]" src="/src/lib/image/quesFrame.png" alt="" />
					<span
						class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[56%] font-number-display text-[9vh] text-black"
						>{ques}</span
					>
				</div>
				<div
					class="absolute left-1/2 top-1/2 z-50 w-[70vw] -translate-x-1/2 -translate-y-1/2 text-center font-semibold"
					style={`font-size: ${fontSize}vh;`}
					bind:clientHeight={textHeight}
				>
					<div class:invisible={!displayQuestion}>
						{generalQuestions[ques - 1]}
					</div>
				</div>
			</div>
			{#if bellRingedContestant}
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
			{/if}
			<div
				class="fixed bottom-[7vh] right-[2vw] flex h-[18vh] w-[14vw] items-center justify-center rounded-[1vh] bg-slate-950 text-[13vh] font-bold"
				in:slide={{ duration: 7000 }}
			>
				{timeStatus ? time : ''}
			</div>
		</div>
	{:else if scr_slide.startsWith('ques_ts')}
		<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat px-[2vw]">
			<div
				class="fixed bottom-[7vh] h-[84vh] w-[80vw] rounded-[1vh] bg-slate-950 bg-bg-kd bg-contain bg-center bg-no-repeat"
				in:scale={{ duration: 7000 }}
				bind:clientHeight={containerHeight}
			>
				<div class="absolute left-[4.3vw] top-[6vh]">
					<img class="h-[11vh] scale-x-[130%]" src="/src/lib/image/quesFrame.png" alt="" />
					<span
						class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[56%] font-number-display text-[9vh] text-black"
						>{ques}</span
					>
				</div>
				<div
					class="absolute left-1/2 top-1/2 z-50 w-[70vw] -translate-x-1/2 -translate-y-1/2 text-center font-semibold"
					style={`font-size: ${fontSize}vh;`}
					bind:clientHeight={textHeight}
				>
					<div class:invisible={!displayQuestion}>
						{personalQuestions[contestantMap.get(scr_slide) ?? 0][ques - 1]}
					</div>
				</div>
			</div>
			<div
				class="fixed bottom-[7vh] right-[2vw] flex h-[18vh] w-[14vw] items-center justify-center rounded-[1vh] bg-slate-950 text-[13vh] font-bold"
				in:slide={{ duration: 7000 }}
			>
				{timeStatus ? time : ''}
			</div>
		</div>
	{:else if scr_slide === 'end'}
		<div></div>
	{/if}
</div>

<!-- {:else if scr_slide === 'ques'}
<div class="h-full w-screen bg-bg-2 bg-cover">
	<div
		class="relative flex h-[90vh] items-center justify-center bg-bg-kd bg-contain bg-no-repeat text-white"
	>
		<div class=" absolute left-[3.5rem] top-12 text-[5rem] text-black">
			<h1
				class="absolute -top-2 left-[85px] z-10 -translate-x-1/2 font-number-display font-semibold"
			>
				{ques}
			</h1>
		</div>
		{#if displayQuestion}
			<p
				class="w-[80%] text-center text-2xl font-medium xl:text-[4rem] xl:leading-[5rem]"
				in:fade={{ duration: 100 }}
			>
				{questions[ques - 1]}
			</p>
		{/if}
	</div>
	<h1 class="text-[7rem]">{time}</h1>
</div> -->
