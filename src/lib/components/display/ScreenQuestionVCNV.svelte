<script lang="ts">
	import { sendSoundRequest } from '$lib/utils';
	import type { RecordModel } from 'pocketbase';
	import { onMount } from 'svelte';

	// import logo from '$lib/image/4t.png';
	import { scale, fade, slide } from 'svelte/transition';

	export let questionNumber: number = 0;
	export let question = '';
	export let displayQuestion: boolean = false;
	export let contestantBell: string[] = [];

	onMount(() => {
		sendSoundRequest('vcnv_row_question');
	});
</script>

<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat">
	<div>
		<img
			class="absolute left-1/2 top-1/2 h-[95vh] w-[90vw] -translate-x-1/2 -translate-y-1/2"
			style={`filter: drop-shadow(8px 28px 32px #335);`}
			src="/src/lib/image/bg-ques.svg"
			alt="BG"
			in:scale={{ duration: 900 }}
		/>
		<div
			class="absolute left-[9vw] top-[11.5vh] flex h-[12vh] w-[10vw] items-center justify-center bg-white font-number-display text-[9vh] font-extrabold text-black"
			style="clip-path: polygon(100% 0, 100% 70%, 80% 100%, 0 100%, 0 0);"
			in:slide={{ delay: 940, duration: 600 }}
		>
			{questionNumber == 5 ? 'TT' : questionNumber}
		</div>
		{#if displayQuestion}
			<div class="center-element absolute w-[75vw] text-center text-[5vh] font-medium" in:fade>
				{question}
			</div>
		{/if}
	</div>
</div>
