<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';
	import ScreenStart from '$lib/components/display/ScreenStart.svelte';
	import ScreenRule from '$lib/components/display/ScreenRule.svelte';
	import ScreenIntro from '$lib/components/display/ScreenIntro.svelte';
	import ScreenQuestionTT from '$lib/components/display/ScreenQuestionTT.svelte';
	import ScreenEnd from '$lib/components/display/ScreenEnd.svelte';

	let questions: string[] = [];
	let questionFile: string[] = [];

	let scr_slide: string = '';
	let ques: number = 1;
	let displayQuestion: boolean = false;

	let unsub: (() => void)[] = [];
	onMount(async () => {
		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		scr_slide = displayStatus.slide;
		ques = displayStatus.ques;

		const data = await pb.collection('tt').getOne('4T-QUESTIONS-TT');
		questions = data.question as string[];
		questionFile = [
			pb.files.getUrl(data, data[1]),
			pb.files.getUrl(data, data[2]),
			pb.files.getUrl(data, data[3]),
			pb.files.getUrl(data, data[4])
		];

		// unsub = [
		await pb.collection('display_status').subscribe('*', ({ action, record }) => {
			if (action === 'update') {
				if (record.screen !== 'tt') goto('/display/' + record.screen);
				else {
					if (scr_slide !== record.slide) scr_slide = record.slide;
					if (ques !== record.ques) ques = record.ques;
					if (displayQuestion !== record.displayQuestion) displayQuestion = record.displayQuestion;
				}
				console.log('ASDSAFAGEGAVDSADFASD');
			}
		});
		// ];
	});
	onDestroy(() => pb.collection('display_status').unsubscribe('*'));
</script>

<svelte:head>
	<title>tt/{scr_slide}/{ques}</title>
</svelte:head>

{#if scr_slide === 'start'}
	<ScreenStart screen="tt" />
{:else if scr_slide === 'rule'}
	<ScreenRule screen="tt" />
{:else if scr_slide === 'intro'}
	<ScreenIntro screen="tt" />
{:else if scr_slide === 'ques'}
	<ScreenQuestionTT
		questionNumber={ques}
		questionContent={questions[ques - 1]}
		questionFile={questionFile[ques - 1]}
		{displayQuestion}
	/>
	<div class="fixed">{questionFile[ques - 1]} {scr_slide}</div>
{:else if scr_slide === 'end'}
	<ScreenEnd />
{/if}
``
