<script lang="ts">
	import { pb } from '$lib/pocketBase';
	import ScreenStart from '$lib/components/display/ScreenStart.svelte';
	import ScreenRule from '$lib/components/display/ScreenRule.svelte';
	import ScreenIntro from '$lib/components/display/ScreenIntro.svelte';
	import ScreenQuestionTT from '$lib/components/display/ScreenQuestionTT.svelte';
	import ScreenSolvedTT from '$lib/components/display/ScreenSolvedTT.svelte';
	import ScreenEnd from '$lib/components/display/ScreenEnd.svelte';
	import type { RecordModel } from 'pocketbase';

	export let displayStatus: RecordModel;
	export let tt: { questions: RecordModel; solve: RecordModel };

	let questions: {content:string, time: number}[] = [];
	let questionFile: string[] = [];
	let questionFileSolved: string[] = [];

	let scr_slide: string = '';
	let ques: number = 1;
	let displayQuestion: boolean = false;

	$: scr_slide = displayStatus?.slide || '';
	$: ques = displayStatus?.ques || 1;
	$: displayQuestion = displayStatus?.displayQuestion || false;
	$: if (tt.questions) {
		questions = tt.questions.question as {content:string, time: number}[];
		questionFile = [
			pb.files.getUrl(tt.questions, tt.questions[1]),
			pb.files.getUrl(tt.questions, tt.questions[2]),
			pb.files.getUrl(tt.questions, tt.questions[3]),
			pb.files.getUrl(tt.questions, tt.questions[4])
		];
	}
	$: if (tt.solve) {
		questionFileSolved = [
			pb.files.getUrl(tt.solve, tt.solve[1]),
			pb.files.getUrl(tt.solve, tt.solve[2]),
			pb.files.getUrl(tt.solve, tt.solve[3]),
			pb.files.getUrl(tt.solve, tt.solve[4])
		];
	}
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
		questionContent={questions[ques - 1]?.content ?? ''}
		questionTime={questions[ques - 1]?.time ?? 30}
		questionFile={questionFile[ques - 1]}
		{displayQuestion}
	/>
	<!-- <div class="fixed">{questionFile[ques - 1]} {scr_slide}</div> -->
{:else if scr_slide === 'solve'}
	<ScreenSolvedTT
		questionNumber={ques}
		questionContent={questions[ques - 1]?.content ?? ''}
		questionFile={questionFileSolved[ques - 1]}
	/>
{:else if scr_slide === 'end'}
	<ScreenEnd />
{/if}
``
