<script lang="ts">
	import { scale, slide } from 'svelte/transition';
	import logo from '$lib/image/4t.png';
	import { sendSoundRequest } from '$lib/utils';
	import { onMount } from 'svelte';

	export let isContestantEnd: boolean = false;

	onMount(() => {
		if (isContestantEnd) sendSoundRequest('kd_end');
		else sendSoundRequest('vd_end');
	});
</script>

<div class="fixed h-full w-full bg-bg-3 bg-cover bg-no-repeat">
	<img
		class="center-element fixed h-[50vh]"
		src={logo}
		alt="Logo 4T"
		in:slide={{ duration: 4000 }}
	/>
</div>
