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
	let screen: string = 'vd';
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

		unsub = [
			await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
				if (action === 'update') {
					screen = record.screen;
					scr_slide = record.slide;
					ques = record.ques;
				}
			})
		];
	});

	onDestroy(() => unsub.forEach((currentValue) => currentValue?.()));

	$: if (screen != 'vd') goto('/display/' + screen);
</script>

<div class="pointer-events-none h-screen w-screen select-none bg-black text-white">
	{#if scr_slide === 'start'}
		<ScreenStart />
	{:else if scr_slide === 'rule'}
		<ScreenRule screen="vd" />
	{:else if scr_slide === 'intro'}
		<ScreenIntro screen="vd" />
	{:else if scr_slide === 'ques'}
		<div></div>
	{:else if scr_slide === 'end'}
		<div></div>
	{/if}
</div>
``
