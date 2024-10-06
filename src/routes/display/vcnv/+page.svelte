<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';

	let questions: string[] = [];
	let screen: string = 'vcnv';
	let slide: string = 'start';
	let ques: number = 1;
	let unsub: (() => void)[] = [];

	onMount(async () => {
		const displayStatus = await pb.collection('display_status').getOne('4t-displaystate');
		screen = displayStatus.screen;
		slide = displayStatus.slide;
		ques = displayStatus.ques;

		// const questionList = await pb.collection('ques_tt').getOne('4t-questions-vcnv');
		// questions = questionList.question;

		unsub[0] = await pb.collection('display_status').subscribe('*', ({ action, record }) => {
			if (action === 'update') {
				screen = record.screen;
				slide = record.slide;
				ques = record.ques;
			}
		});
	});

	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	$: if (screen != 'vcnv') {
		goto('/display/' + screen);
	}
</script>

<h1 class="text-[10rem]">VCNV {slide} {ques}</h1>
