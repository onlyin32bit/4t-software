<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import type { RecordModel } from 'pocketbase';
	import { onDestroy, onMount } from 'svelte';

	let questions: RecordModel;
	let rows: any[] = [];
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

		const data = await pb.collection('vcnv').getOne('4T-QUES-VCNV-BK');
		questions = data.question;
		// firstSet = questions.first;
		// secondSet = questions.second;
		rows = questions.rows ?? [];

		unsub = [
			await pb.collection('display_status').subscribe('*', ({ action, record }) => {
				if (action === 'update') {
					screen = record.screen;
					slide = record.slide;
					ques = record.ques;
					if (displayQuestion !== record.displayQuestion) displayQuestion = true;
				}
			})
		];
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

<div>
	<h1>{questions?.obstacle}</h1>
	<!-- <div>{firstSet[ques - 1].key} {firstSet[ques - 1].question}</div> -->
	{#each rows as row}
		<div class="flex justify-center">
			{#each row.keyword as character}
				<div
					class="flex h-[15vh] w-[15vh] items-center justify-center rounded-full bg-blue-100 text-[9vh] font-semibold"
				>
					{character}
				</div>
			{/each}
		</div>
	{/each}
</div>
