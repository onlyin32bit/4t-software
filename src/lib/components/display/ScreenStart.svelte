<script lang="ts">
	import logo from '$lib/image/4t.png';
	import { fade } from 'svelte/transition';

	// export let text: string = '';
</script>

<div class="fixed h-full w-full bg-bg-3 bg-cover bg-no-repeat" out:fade>
	<img class="center-element fixed h-[50vh]" src={logo} alt="Logo 4T" in:fade />
	<!-- {#if text}
		<h1>{text}</h1>
	{/if} -->
</div>
