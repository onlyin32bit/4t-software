<script lang="ts">
	import type { RecordModel } from 'pocketbase';
	import { fade } from 'svelte/transition';

	export let contestants: RecordModel[] = [];
</script>

<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat" transition:fade>
	<div
		class="fixed right-[2vw] top-[26vh] space-y-[3vh] text-[4vh] font-medium"
		in:fade={{ duration: 1000 }}
	>
		{#each contestants as contestant, i}
			<div
				class="flex w-[18vw] items-center justify-between bg-gradient-to-tr from-[#093278] to-[#093278] px-[1vw]"
				style={`border: 0.5vh solid #6EB0ED; filter: drop-shadow(8px 8px 17px #335) brightness(${contestant.ring > 0 ? '1.0' : '0.4'});`}
			>
				<div>{contestant.name}</div>
				<!-- <div class="font-mono font-semibold filter-none">{contestant.score}</div> -->
			</div>
		{/each}
	</div>
</div>
