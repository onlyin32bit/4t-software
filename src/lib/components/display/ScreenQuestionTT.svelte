<script lang="ts">
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';
	import { sendSoundRequest } from '$lib/utils';
	import { slide, scale } from 'svelte/transition';
	import { tweened } from 'svelte/motion';

	export let questionNumber: number;
	export let questionContent: string;
	export let questionFile: string;
	export let displayQuestion: boolean = false;

	onMount(async () => {
		sendSoundRequest('tt_start_question');

		await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
			if (action === 'update' && record.timer !== -1) {
				time.set(0, { duration: 0 });
				timer();
			}
		});
	});
	onDestroy(() => pb.collection('display_status').unsubscribe('4T-DISPLAYSTATE'));

	let time = tweened(0, { duration: 30000 });

	async function timer() {
		$time = 31;
	}

	$: if (questionNumber) {
		time.set(0, { duration: 0 });
		fontSize = 3;
	}

	let containerHeight: number = 0;
	let textHeight: number = 0;
	let fontSize: number = 3;

	function calcPercent(x: number, y: number): number {
		return (x / y) * 100;
	}

	$: if (questionNumber && calcPercent(textHeight, containerHeight) < 85) {
		fontSize += 0.1;
	}
</script>

<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat" in:slide={{ duration: 1500 }}>
	<div>
		<img
			class="absolute left-[10vw] w-[73vw]"
			style={`filter: drop-shadow(8px 28px 32px #335);`}
			src="/src/lib/image/bg-tt.svg"
			alt="BG"
			in:scale={{ delay: 900, duration: 1000 }}
		/>
		<div
			class="fixed bottom-[3.2vh] left-[5vw] h-[92.5vh] w-[6vw] overflow-hidden bg-gray-200 outline-8"
			style={`filter: drop-shadow(8px 28px 32px #335); border: 1vh solid #88badf;`}
			in:scale={{ delay: 900, duration: 1000 }}
		>
			<div
				class="absolute top-0 h-[110%] w-full"
				style={`background: linear-gradient(to top, #f00 ${($time / 32) * 100}%, rgba(0,0,0,0) ${($time / 32) * 100 + 10}%);`}
			></div>
		</div>
		<div
			class="fixed left-[14vw] top-[7vh] h-[12vh] w-[64vw] font-semibold"
			bind:clientHeight={containerHeight}
		>
			<div
				class="absolute left-1/2 top-1/2 z-50 w-[63vw] -translate-x-1/2 -translate-y-1/2 text-center"
				style={`font-size: ${fontSize}vh; text-shadow: 3px 1px 11px rgba(103, 103, 140, 1);`}
				bind:clientHeight={textHeight}
			>
				<div class="whitespace-pre-line" class:invisible={!displayQuestion}>
					{questionContent}
				</div>
			</div>
		</div>
		<div class="fixed bottom-[4.42vh] left-[14vw] h-[72vh] w-[65vw]">
			{#if displayQuestion}
				{#if questionNumber % 2 === 1}
					<img
						class="absolute left-1/2 h-full -translate-x-1/2"
						src={questionFile}
						alt={questionFile}
					/>
				{:else if $time > 0}
					<video class="absolute left-1/2 h-full -translate-x-1/2" muted autoplay>
						<source src={questionFile} type="video/mp4" />
						<h1>ERROR</h1>
					</video>
				{/if}
			{/if}
		</div>
	</div>
	<!-- <div>{calcPercent(textHeight, containerHeight)} {containerHeight} {textHeight} {fontSize}</div> -->
</div>
