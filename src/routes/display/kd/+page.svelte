<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';
	import type { RecordModel } from 'pocketbase';
	import ScreenStart from '$lib/components/display/ScreenStart.svelte';
	import ScreenRule from '$lib/components/display/ScreenRule.svelte';
	import ScreenIntro from '$lib/components/display/ScreenIntro.svelte';
	import ScreenQuestionKD from '$lib/components/display/ScreenQuestionKD.svelte';
	import ScreenEnd from '$lib/components/display/ScreenEnd.svelte';

	let generalQuestions: string[] = [];
	let contestantQuestions: string[][] = [[]];

	const contestantMap: Map<string, number> = new Map([
		['ques_ts1', 0],
		['ques_ts2', 1],
		['ques_ts3', 2],
		['ques_ts4', 3]
	]);

	let contestants: RecordModel[] = [];
	let scr_slide: string = 'start';
	let ques: number = 1;
	let displayQuestion: boolean = false;

	let unsub: (() => void)[] = [];
	onMount(async () => {
		const userListRecord = await pb.collection('users').getFullList();
		contestants = userListRecord;

		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		scr_slide = displayStatus.slide;
		ques = displayStatus.ques;

		const generalQuestionList = await pb.collection('kd').getOne('4T-QUESKD-CHUNG');
		const contestantQuestionList = await pb.collection('kd').getOne('4T-QUESTS-RIENG');
		generalQuestions = generalQuestionList.question as string[];
		contestantQuestions = contestantQuestionList.question as string[][];

		unsub = [
			await pb.collection('display_status').subscribe('*', ({ action, record }) => {
				if (action === 'update') {
					if (record.screen !== 'kd') goto('/display/' + record.screen);
					if (scr_slide !== record.slide) scr_slide = record.slide;
					if (ques !== record.ques) ques = record.ques;
					displayQuestion = record.displayQuestion;
				}
			}),
			await pb.collection('users').subscribe('*', ({ action, record }) => {
				if (action === 'update')
					contestants = contestants.map((currentValue) =>
						currentValue.id === record.id ? record : currentValue
					);
			})
		];
	});
	onDestroy(() => unsub.forEach((currentValue) => currentValue?.()));
</script>

<svelte:head>
	<title>kd/{scr_slide}</title>
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
		<ScreenQuestionKD
			questionNumber={ques}
			questionContent={generalQuestions[ques - 1]}
			needBell={true}
			{displayQuestion}
			{contestants}
		/>
	{:else if scr_slide.startsWith('ques_ts')}
		<ScreenQuestionKD
			questionNumber={ques}
			questionContent={contestantQuestions[contestantMap.get(scr_slide) ?? 0][ques - 1]}
			needBell={false}
			{displayQuestion}
			{contestants}
		/>
	{:else if scr_slide === 'end'}
		<ScreenEnd />
	{/if}
</div>
