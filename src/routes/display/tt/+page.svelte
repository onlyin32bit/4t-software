<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';
	import { fade, slide, scale } from 'svelte/transition';
	import ScreenStart from '$lib/components/display/ScreenStart.svelte';
	import ScreenRule from '$lib/components/display/ScreenRule.svelte';
	import ScreenIntro from '$lib/components/display/ScreenIntro.svelte';

	let questions: { question: string; file_type: string }[] = [];
	let fileNames: string[] = [];
	let screen: string = 'tt';
	let scr_slide: string = 'start';
	let ques: number = 1;
	let time: number = 10;
	let displayQuestion: boolean = false;
	let displayQuestionContent: boolean = false;

	let unsub: (() => void)[] = [];
	onMount(async () => {
		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		screen = displayStatus.screen;
		scr_slide = displayStatus.slide;
		ques = displayStatus.ques;

		const questionList = await pb.collection('tt').getOne('4T-QUESTIONS-TT');

		questions = questionList.question;
		fileNames = questionList.files;

		unsub = [
			await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
				if (action === 'update') {
					screen = record.screen;
					scr_slide = record.slide;
					ques = record.ques;
					if (displayQuestion !== record.displayQuestion) {
						displayQuestion = true;
					}
					// if (record.timer != -1) timer();
				}
			})
		];
	});

	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	let containerHeight: number;
	let textHeight: number;
	let fontSize: number = 1;

	function getFileUrl(url: string): string {
		return pb.baseUrl + '/api/files/tt/4T-QUESTIONS-TT/' + url;
	}

	function calcPercent(x: number, y: number): number {
		return (x / y) * 100;
	}

	$: if (calcPercent(textHeight, containerHeight) < 53) {
		fontSize += 0.5;
	}

	$: {
		ques;
		time = 15;
		displayQuestion = false;
		fontSize = 1;
	}

	$: if (screen != 'tt') goto('/display/' + screen);
</script>

<div class="pointer-events-none h-screen w-screen select-none bg-black text-white">
	{#if scr_slide === 'start'}
		<ScreenStart />
	{:else if scr_slide === 'rule'}
		<ScreenRule screen="tt" />
	{:else if scr_slide === 'intro'}
		<ScreenIntro screen="tt" />
	{:else if scr_slide === 'ques'}
		<!-- <div >
			<div
				class="fixed bottom-[7vh] h-[84vh] w-[80vw] rounded-[1vh] bg-slate-950 bg-bg-kd bg-contain bg-center bg-no-repeat"
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
						{questions[ques - 1]}
					</div>
				</div>
			</div>
			<div
				class="fixed bottom-[7vh] right-[2vw] flex h-[18vh] w-[14vw] items-center justify-center rounded-[1vh] bg-slate-950 text-[13vh] font-bold"
			>
				{time}
			</div>
		</div> -->
		<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat text-[10vh]">
			<div class="relative h-[8vh] w-screen bg-black"></div>
			<div class="rounded-full">{ques}</div>
			<div class="">{questions[ques - 1]?.question}</div>
			<div class:invisible={!displayQuestion}>
				{#if questions[ques - 1]?.file_type === 'png'}
					<img src={getFileUrl(fileNames[ques - 1])} alt={fileNames[ques - 1]} />
				{:else}
					<!-- svelte-ignore a11y-media-has-caption -->
					<video src={getFileUrl(fileNames[ques - 1])} muted autoplay> </video>
				{/if}
			</div>
			<!-- <p>{file_names[ques - 1]}</p> -->
		</div>
	{:else if scr_slide === 'end'}
		<div></div>
	{/if}
</div>
``
