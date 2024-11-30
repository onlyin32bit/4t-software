<script lang="ts">
	import { scale } from 'svelte/transition';
	import logo from '$lib/image/4t.png';
	import { sendSoundRequest } from '$lib/utils';
	import { onMount } from 'svelte';

	onMount(() => {
		sendSoundRequest('vd_end');
	});
</script>

<div class="fixed h-full w-full bg-bg-3 bg-cover bg-no-repeat">
	<img
		class="center-element fixed h-[50vh]"
		src={logo}
		alt="Logo 4T"
		in:scale={{ duration: 2000 }}
	/>
</div>
