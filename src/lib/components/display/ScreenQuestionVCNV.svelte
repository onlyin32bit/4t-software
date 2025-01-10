<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { pb } from '$lib/pocketBase';
	import type { RecordModel } from 'pocketbase';
	import { sendSoundRequest } from '$lib/utils';
	import { fly, scale, slide, fade } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';

	export let questionNumber: number = 0;
	export let questionContent: string = '';
	export let questionType: string = '';
	export let questionFile: string = '';
	export let displayQuestion: boolean = false;
	export let contestants: RecordModel[] = [];

	let time = tweened(0, { duration: 15000 });

	onMount(async () => {
		sendSoundRequest('vcnv_row_question');

		await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
			if (action === 'update') {
				if (record.timer === -1) {
					if ($time !== 15) time.set(0, { duration: 0 });
				} else if ($time <= 0) {
					time.set(0, { duration: 0 });
					timer();
				}
			}
		});
	});
	onDestroy(() => pb.collection('display_status').unsubscribe('4T-DISPLAYSTATE'));

	function timer() {
		$time = 15;
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

	$: if (questionNumber && calcPercent(textHeight, containerHeight) < 60) {
		fontSize += 0.2;
	}
</script>

<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat">
	<img
		class="absolute left-[45vw] top-[2vh] h-[90vh] w-[90vw] -translate-x-1/2"
		style={`filter: drop-shadow(8px 28px 32px #335);`}
		src="/src/lib/image/bg-ques.svg"
		alt="BG"
		in:scale={{ duration: 750 }}
	/>
	<div
		class="absolute left-[6.7vw] top-[11.4vh] flex h-[10vh] w-[8vw] items-center justify-center bg-white font-number-display text-[9vh] font-extrabold text-black"
		class:invisible={questionNumber > 5}
		style="clip-path: polygon(100% 0, 100% 70%, 80% 100%, 0 100%, 0 0);"
		in:slide={{ delay: 750, duration: 600 }}
	>
		{questionNumber == 5 ? 'TT' : questionNumber}
	</div>
	<div
		class="absolute left-[5vw] top-[17vh] h-[60vh] w-[70vw] font-semibold"
		bind:clientHeight={containerHeight}
	>
		<div
			class="absolute left-[40vw] top-1/2 z-50 w-[70vw] -translate-x-1/2 -translate-y-1/2 text-left"
			style={`font-size: ${fontSize}vh;`}
			bind:clientHeight={textHeight}
		>
			<div class="whitespace-pre-line" class:invisible={!displayQuestion}>
				{questionContent}
			</div>
		</div>
	</div>
	<div in:fade={{ delay: 800 }}>
		<div
			class="absolute bottom-[13.6vh] right-[86vw] h-[5vh] w-[2.92vw] bg-gradient-to-b from-slate-200 to-sky-200"
			style={`clip-path: polygon(0 0, 100% 0, 100% 100%, 93% 100%);`}
		></div>
		<div
			class="absolute bottom-[13.6vh] right-[15.9vw] flex h-[5vh] w-[70.2vw] items-center bg-gradient-to-br from-slate-200 via-sky-200 to-slate-300"
		>
			{#if $time > 0}
				<div
					class=" h-1/2 w-full rounded-[2vh] bg-red-500"
					style={`box-shadow: 0 0 1vh 0.1vh rgba(256,0,0,0.5); width: ${($time * 100) / 15}%;`}
					in:scale={{ delay: 200 }}
				></div>
				<div
					class="animate-shadowPulse size-[3.5vh] -translate-x-[1.5vh] rounded-full bg-red-600"
					style={`//box-shadow: 0 0 1.5vh 1vh rgba(256,0,0,0.5);`}
					in:scale={{ duration: 200, opacity: 1 }}
				></div>
			{/if}
		</div>
	</div>

	<div class="fixed bottom-[2.5vh] left-[2.5vw] flex gap-[2vw] text-[5vh] font-bold">
		{#each contestants as contestant, i (i)}
			{#if contestant.ring > 0}
				<div
					class="flex items-center justify-center gap-[1vw] rounded-[1vh] border-[0.7vh] bg-gradient-to-tr from-[#0F247D] to-[#26164D] px-[1vw]"
					in:fly={{ x: 100 }}
				>
					<svg class="h-[5vh] animate-wiggle" fill="#fff" viewBox="0 0 448 512">
						<path
							d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
						/>
					</svg>
					{contestant.name}
				</div>
			{/if}
		{/each}
	</div>
</div>
