<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import type { RecordModel } from 'pocketbase';
	import type { QuestionObject } from '$lib/types';
	import ScreenStart from '$lib/components/display/ScreenStart.svelte';
	import ScreenRule from '$lib/components/display/ScreenRule.svelte';
	import ScreenIntro from '$lib/components/display/ScreenIntro.svelte';
	import ScreenQuestionKD from '$lib/components/display/ScreenQuestionKD.svelte';
	import ScreenEnd from '$lib/components/display/ScreenEnd.svelte';
	import ScreenPreQuestionKD from '$lib/components/display/ScreenPreQuestionKD.svelte';

	export let users: RecordModel[];
	export let displayStatus: RecordModel;
	export let kd: { chung: RecordModel; rieng: RecordModel };

	let generalQuestions: QuestionObject[] = [];
	let generalQuestionFiles: string[] = [];
	let contestantQuestions: Array<Array<QuestionObject>> = [[], [], [], []];
	let contestantQuestionFiles: string[][] = [[], [], [], []];

	const contestantIndex: {
		[key: string]: number;
	} = {
		ques_ts1: 0,
		ques_ts2: 1,
		ques_ts3: 2,
		ques_ts4: 3
	};

	let contestants: RecordModel[] = [];
	let scr_slide: string = '';
	let ques: number = 1;
	let displayQuestion: boolean = false;

	$: contestants = users;
	$: scr_slide = displayStatus?.slide || '';
	$: ques = displayStatus?.ques || 1;
	$: displayQuestion = displayStatus?.displayQuestion || false;
	$: if (kd.chung) {
		generalQuestions = kd.chung.question as QuestionObject[];
		if (JSON.stringify(kd.chung.files) !== '[]')
			for (let index = 1; index <= 12; index++) {
				generalQuestionFiles[index - 1] = pb.files.getUrl(
					kd.chung,
					kd.chung.files?.find((currentValue: string) =>
						currentValue.startsWith(`${index}_ques`)
					) ?? ''
				);
			}
	}
	$: if (kd.rieng) {
		contestantQuestions = kd.rieng.question as Array<Array<QuestionObject>>;
		if (JSON.stringify(kd.rieng.files) !== '[]')
			for (let contestantIndex = 1; contestantIndex <= 4; contestantIndex++) {
				if (
					kd.rieng.files?.findIndex((currentValue: string) =>
						currentValue.startsWith(`ts_${contestantIndex}`)
					) !== -1
				)
					for (let fileIndex = 1; fileIndex <= 3; fileIndex++) {
						contestantQuestionFiles[contestantIndex - 1][fileIndex - 1] = pb.files.getUrl(
							kd.rieng,
							kd.rieng.files?.find((currentValue: string) =>
								currentValue.startsWith(`ts_${contestantIndex}_${fileIndex}_ques`)
							) ?? ''
						);
					}
			}
	}
</script>

<svelte:head>
	<title>kd/{scr_slide}</title>
</svelte:head>

{#if scr_slide === 'start'}
	<ScreenStart screen="kd" />
{:else if scr_slide === 'rule'}
	<ScreenRule screen="kd" />
{:else if scr_slide === 'intro'}
	<ScreenIntro screen="kd" />
{:else if scr_slide === 'main_kd'}
	<div class="fixed h-full w-full bg-bg-3 bg-cover bg-no-repeat"></div>
{:else if scr_slide === 'test_bell'}
	<ScreenPreQuestionKD {contestants} />
{:else if scr_slide === 'ques_chung'}
	<ScreenQuestionKD
		questionNumber={ques}
		questionContent={generalQuestions[ques - 1]?.content}
		questionType={generalQuestions[ques - 1]?.type}
		questionFile={generalQuestionFiles[ques - 1]}
		{displayQuestion}
		{contestants}
	/>
{:else if scr_slide.startsWith('ques_ts')}
	<ScreenQuestionKD
		questionNumber={ques}
		questionContent={contestantQuestions[contestantIndex[scr_slide]][ques - 1]?.content}
		questionType={contestantQuestions[contestantIndex[scr_slide]][ques - 1]?.type}
		questionFile={contestantQuestionFiles[contestantIndex[scr_slide]][ques - 1] ?? ''}
		{displayQuestion}
		{contestants}
		currentContestantTurn={contestantIndex[scr_slide]}
	/>
{:else if scr_slide === 'end_ts'}
	<ScreenEnd isContestantEnd={true} />
{:else if scr_slide === 'end'}
	<ScreenEnd />
{/if}
