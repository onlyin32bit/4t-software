<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';

	let questions: any;
	let firstSet: { key: string; question: string }[] = [];
	let secondSet: { key: string; question: string }[] = [];
	let screen: string = 'vcnv';
	let slide: string = 'start';
	let ques: number = 1;
	let displayQuestion: boolean = false;

	let unsub: (() => void)[] = [];

	onMount(async () => {
		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		screen = displayStatus.screen;
		slide = displayStatus.slide;
		ques = displayStatus.ques;

		const data = await pb.collection('vcnv').getOne('4t-quest-vcnvtk');
		questions = data.question;
		firstSet = questions.first;
		secondSet = questions.second;

		unsub[0] = await pb.collection('display_status').subscribe('*', ({ action, record }) => {
			if (action === 'update') {
				screen = record.screen;
				slide = record.slide;
				ques = record.ques;
				if (displayQuestion !== record.displayQuestion) displayQuestion = true;
			}
		});
	});

	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	$: {
		ques;
		displayQuestion = false;
	}

	$: if (screen != 'vcnv') goto('/display/' + screen);
</script>

<h1 class="text-[10rem]">VCNV {slide} {ques}</h1>
<div>
	<h1>{questions?.keyword}</h1>
	<div>{firstSet[ques - 1].key} {firstSet[ques - 1].question}</div>
	{#each secondSet as ques}
		<div>{ques.key} {ques.question}</div>
	{/each}
</div>
