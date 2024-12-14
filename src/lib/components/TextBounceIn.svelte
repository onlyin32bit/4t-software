<script lang="ts">
	import { elasticIn } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	export let text: string;
</script>

<div class="flex items-center justify-center font-extrabold">
	{#each text as character, i}
		<div
			class="text-center text-[11vh]"
			style={`width: ${character === ' ' ? 1 : 4.5}vw`}
			in:fly={{ duration: 1000, delay: 100 * i, y: -500, easing: elasticIn }}
		>
			{character}
		</div>
	{/each}
</div>
