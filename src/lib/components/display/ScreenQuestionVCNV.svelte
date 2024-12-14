<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { pb } from '$lib/pocketBase';
	import type { RecordModel } from 'pocketbase';
	import { sendSoundRequest } from '$lib/utils';
	import { fly } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	import { scale, fade, slide } from 'svelte/transition';

	export let questionNumber: number = 0;
	export let question = '';
	export let displayQuestion: boolean = false;
	export let contestants: RecordModel[] = [];

	let time = tweened(0, { duration: 15000 });

	onMount(async () => {
		sendSoundRequest('vcnv_row_question');

		await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
			if (action === 'update' && record.timer !== -1) {
				time.set(0, { duration: 0 });
				timer();
			}
		});
	});
	onDestroy(() => pb.collection('display_status').unsubscribe('4T-DISPLAYSTATE'));

	function timer() {
		$time = 15;
	}
</script>

<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat">
	<img
		class="absolute left-1/2 top-[2vh] h-[90vh] w-[90vw] -translate-x-1/2"
		style={`filter: drop-shadow(8px 28px 32px #335);`}
		src="/src/lib/image/bg-ques.svg"
		alt="BG"
		in:scale={{ duration: 900 }}
	/>
	<div
		class="absolute left-[11.5vw] top-[11vh] flex h-[10vh] w-[8vw] items-center justify-center bg-white font-number-display text-[9vh] font-extrabold text-black"
		class:invisible={questionNumber > 5}
		style="clip-path: polygon(100% 0, 100% 70%, 80% 100%, 0 100%, 0 0);"
		in:slide={{ delay: 940, duration: 600 }}
	>
		{questionNumber == 5 ? 'TT' : questionNumber}
	</div>
	{#if displayQuestion}
		<div class="center-element absolute w-[70vw] text-center text-[5vh] font-medium" in:fade>
			{question}
		</div>
	{/if}
	<div in:fade={{ delay: 1000 }}>
		<div
			class="absolute bottom-[13.6vh] right-[81vw] h-[5vh] w-[2.92vw] bg-[#88badf]"
			style={`clip-path: polygon(0 0, 100% 0, 100% 100%, 93% 100%);`}
		></div>
		<div
			class="absolute bottom-[13.6vh] right-[10.8vw] h-[5vh] w-[70.4vw] bg-white"
			style={`border: 1vh solid #88badf;`}
		>
			<div
				class="absolute left-0 h-full w-full"
				style={`background: linear-gradient(to right, #f00 ${($time / 15) * 100 - ($time === 15 ? 0 : 5)}%, rgba(0,0,0,0) ${($time / 15) * 100}%);`}
			></div>
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
