<script lang="ts">
	import { scale, slide, fade } from 'svelte/transition';
	import { sendSoundRequest } from '$lib/utils';
	import { onMount } from 'svelte';

	export let isContestantEnd: boolean = false;

	onMount(() => {
		if (isContestantEnd) sendSoundRequest('kd_end');
		else sendSoundRequest('vd_end');
	});
</script>

<div class="fixed w-full h-full bg-no-repeat bg-cover bg-bg-3">
	<img
		class="center-element fixed h-[50vh]"
		src="/4t.png"
		alt="Logo 4T"
		in:slide={{ duration: 4000 }}
	/>
</div>
