<script lang="ts">
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';
	import { sendSoundRequest } from '$lib/utils';
	import { slide } from 'svelte/transition';

	export let questionNumber: number;
	export let questionContent: string;
	export let questionFile: string;
	export let displayQuestion: boolean = false;

	onMount(async () => {
		sendSoundRequest('tt_start_question');

		await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
			if (action === 'update' && record.timer !== -1) {
				sendSoundRequest('tt_time');
				timer();
			}
		});
	});
	// onDestroy(() => pb.collection('display_status').unsubscribe('4T-DISPLAYSTATE'));

	let time: number = 30;
	// let timeStatus: boolean = false;

	async function timer() {
		time = 30;
		// timeStatus = true;
		let countdown: any = setInterval(() => {
			time -= 0.01;
			if (time <= 0) {
				clearInterval(countdown);
				countdown = null;
				time = 0;
			}
		}, 10);
	}

	$: if (questionNumber) {
		displayQuestion = false;
		time = 30;
	}

	let containerHeight: number;
	let textHeight: number;
	let fontSize: number = 3;

	function calcPercent(x: number, y: number): number {
		return (x / y) * 100;
	}

	$: if (calcPercent(textHeight, containerHeight) < 45) {
		fontSize += 1.2;
	} else if (calcPercent(textHeight, containerHeight) > 65) {
		fontSize -= 0.5;
	}
</script>

<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat" in:slide>
	<div>
		<div>{questionNumber}</div>
		{#if displayQuestion}
			<div>{questionContent}</div>
			{#if questionNumber % 2 === 1}
				<img src={questionFile} alt={questionFile} />
			{:else if time < 30}
				<video muted autoplay>
					<source src={questionFile} type="video/mp4" />
				</video>
				<div>FUCK OFF</div>
			{/if}
		{/if}
	</div>
	<div>{questionFile} {time}</div>
</div>
<!-- {#if displayQuestion} -->
<!-- {/if} -->
