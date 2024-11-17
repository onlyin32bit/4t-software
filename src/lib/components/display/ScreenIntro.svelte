<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { zoomIn } from '$lib/transitions';
</script>

<div
	class="fixed h-full w-full bg-bg-3 bg-cover bg-no-repeat"
	in:scale={{ duration: 4000 }}
	out:fade
>
	<h1
		class="center-element fixed font-game-display text-[15vh] text-yellow-300"
		style="-webkit-text-stroke: 5px #fff;"
		in:zoomIn={{ duration: 5000 }}
	>
		KHỞI ĐỘNG
	</h1>
</div>
