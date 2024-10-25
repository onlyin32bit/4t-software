<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';

	let questions: { question: string; file_type: string }[] = [];
	let file_names: string[] = [];
	let screen: string = 'tt';
	let slide: string = 'start';
	let ques: number = 1;
	let unsub: (() => void)[] = [];

	onMount(async () => {
		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		screen = displayStatus.screen;
		slide = displayStatus.slide;
		ques = displayStatus.ques;

		const questionList = await pb.collection('tt').getOne('4t-questions-tt');
		console.log(questionList);

		questions = questionList.question;
		file_names = questionList.files;

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

	$: if (screen != 'tt') goto('/display/' + screen);
</script>

<!-- <h1 class="text-[10rem]">TANG TOC {slide} {ques}</h1> -->
{#if slide == 'ques'}
	<div>
		<p class="text-4xl">{questions[ques - 1]?.question}</p>
		{#if questions[ques - 1]?.file_type === 'png'}
			<img src={pb.baseUrl + '/api/files/tt/4t-questions-tt/' + file_names[ques - 1]} alt="" />
		{:else}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				src={pb.baseUrl + '/api/files/tt/4t-questions-tt/' + file_names[ques - 1]}
				muted
				autoplay
			>
			</video>
		{/if}
		<p>{file_names[ques - 1]}</p>
	</div>
	<button class="btn" on:click={() => {}}>CLICK ME</button>
{/if}
