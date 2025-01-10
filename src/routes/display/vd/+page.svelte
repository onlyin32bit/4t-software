<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';
	import type { RecordModel } from 'pocketbase';
	import type { QuestionObject } from '$lib/types';
	import ScreenStart from '$lib/components/display/ScreenStart.svelte';
	import ScreenRule from '$lib/components/display/ScreenRule.svelte';
	import ScreenIntro from '$lib/components/display/ScreenIntro.svelte';
	import ScreenPreQuestionVD from '$lib/components/display/ScreenPreQuestionVD.svelte';
	import ScreenQuestionVD from '$lib/components/display/ScreenQuestionVD.svelte';
	import ScreenEnd from '$lib/components/display/ScreenEnd.svelte';

	let questions: { [key: string]: QuestionObject[] }[] = [
		{ '20': [], '30': [] },
		{ '20': [], '30': [] },
		{ '20': [], '30': [] },
		{ '20': [], '30': [] }
	];
	let questionsFile: { [key: string]: string[] }[] = [
		{ '20': [], '30': [] },
		{ '20': [], '30': [] },
		{ '20': [], '30': [] },
		{ '20': [], '30': [] }
	];
	let contestantQuestionSets: { offset: number[]; question_set: string[] }[] = [];
	let currentRingedContestant: number = -1;
	let starStatus: boolean;

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
	let question: number = 1;
	let displayQuestion: boolean = false;

	let unsub: (() => void)[] = [];
	onMount(async () => {
		const userListRecord = await pb.collection('users').getFullList();
		contestants = userListRecord;

		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		scr_slide = displayStatus.slide;
		question = displayStatus.ques;

		const displayStatusVd = await pb.collection('display_status_vd').getOne('4T-DISPLAYSTATE');
		contestantQuestionSets = [
			displayStatusVd[1],
			displayStatusVd[2],
			displayStatusVd[3],
			displayStatusVd[4]
		];
		starStatus = displayStatusVd.star;

		const questionList = await pb.collection('vd').getOne('4T-VEDICHBANKET');
		questions = questionList.question as { '20': QuestionObject[]; '30': QuestionObject[] }[];

		if (JSON.stringify(questionList.files) !== '[]')
			for (let contestantIndex = 1; contestantIndex <= 4; contestantIndex++) {
				if (
					questionList.files?.findIndex((currentValue: string) =>
						currentValue.startsWith(`ts_${contestantIndex}`)
					) !== -1
				)
					['20', '30'].forEach((questionScore) => {
						for (let fileIndex = 1; fileIndex <= 3; fileIndex++) {
							questionsFile[contestantIndex - 1][questionScore][fileIndex - 1] = pb.files.getUrl(
								questionList,
								questionList.files?.find((currentValue: string) =>
									currentValue.startsWith(
										`ts_${contestantIndex}_${questionScore}_${fileIndex}_ques`
									)
								) ?? ''
							);
						}
					});
			}

		unsub = [
			await pb.collection('display_status').subscribe('*', ({ action, record }) => {
				if (action === 'update') {
					if (record.screen !== 'vd') goto('/display/' + record.screen);
					else {
						if (scr_slide !== record.slide) {
							scr_slide = record.slide;
						}
						if (question !== record.ques) question = record.ques;
						displayQuestion = record.displayQuestion;
					}
				}
			}),
			await pb
				.collection('display_status_vd')
				.subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
					if (action === 'update') {
						contestantQuestionSets = [record[1], record[2], record[3], record[4]];
						starStatus = record.star;
					}
				}),
			await pb.collection('users').subscribe('*', ({ action, record }) => {
				if (action === 'update') {
					contestants = contestants.map((currentValue) =>
						currentValue.id === record.id ? record : currentValue
					);
					if (record.ring > 0) {
						currentRingedContestant = contestants.findIndex(({ id }) => id === record.id);
					} else {
						currentRingedContestant = -1;
					}
				}
			})
		];
	});

	onDestroy(() => unsub.forEach((currentValue) => currentValue?.()));

	function getCurrentContestantIndex(s: string): number {
		if (s.startsWith('pre_ques')) return contestantIndex[s.slice(4)];
		else if (s.startsWith('ques_ts')) return contestantIndex[s];
		return -1;
	}

	$: currentContestantIndex = getCurrentContestantIndex(scr_slide);
</script>

{#if scr_slide === 'start'}
	<ScreenStart screen="vd" />
{:else if scr_slide === 'rule'}
	<ScreenRule screen="vd" />
{:else if scr_slide === 'intro'}
	<ScreenIntro screen="vd" />
{:else if scr_slide === 'main_vd'}
	<div class="fixed h-full w-full bg-bg-3 bg-cover bg-no-repeat"></div>
{:else if scr_slide.startsWith('pre_ques')}
	<ScreenPreQuestionVD
		currentContestantName={contestants[currentContestantIndex].name}
		chosenQuestionSet={contestantQuestionSets[currentContestantIndex].question_set}
	/>
{:else if scr_slide.startsWith('ques_ts')}
	<ScreenQuestionVD
		questionNumber={question}
		questionScore={contestantQuestionSets[currentContestantIndex]?.question_set[question - 1] ?? ''}
		questionContent={questions[currentContestantIndex][
			contestantQuestionSets[currentContestantIndex]?.question_set[question - 1]
		][question - 1 + contestantQuestionSets[currentContestantIndex]?.offset[question - 1]]
			.content ?? ''}
		questionType={questions[currentContestantIndex][
			contestantQuestionSets[currentContestantIndex]?.question_set[question - 1]
		][question - 1 + contestantQuestionSets[currentContestantIndex]?.offset[question - 1]].type ??
			''}
		questionFile={questionsFile[currentContestantIndex][
			contestantQuestionSets[currentContestantIndex]?.question_set[question - 1]
		][question - 1] ?? ''}
		{displayQuestion}
		{starStatus}
		{contestants}
		{currentRingedContestant}
		currentContestantTurn={currentContestantIndex}
	/>
{:else if scr_slide === 'end_ts'}
	<ScreenEnd isContestantEnd={true} />
{:else if scr_slide === 'end'}
	<ScreenEnd />
{/if}
``
