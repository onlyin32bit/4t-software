<script lang="ts">
	import { fade, scale, slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';

	let unsub: (() => void)[] = [];
	onMount(async () => {
		unsub = [
			await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
				if (action === 'update' && record.screen !== 'scores') goto('/display/' + record.screen);
			})
		];
	});
	onDestroy(() => unsub.forEach((currentValue) => currentValue?.()));
</script>

<div class="bg-bg-4 h-screen w-screen bg-cover bg-no-repeat text-white">
	<img
		class="fixed left-[35vw] top-[17vh] w-[30vw]"
		style={`filter: drop-shadow(8px 10px 10px #335);`}
		src="/src/lib/image/4t.png"
		alt="Logo 4T"
		in:scale
	/>
	<!-- <img
		class="fixed left-[55vw] top-[23vh] h-[26vh]"
		style={`filter: drop-shadow(8px 10px 10px #335);`}
		src="/src/lib/image/logo-cbt.png"
		alt="Logo THPT Chuyen Ben Tre"
	/> -->
	<h1
		class="fixed top-[53vh] w-screen text-center text-[14vh] font-extrabold"
		style={`text-shadow: 0.1vh 0.5vh 1vh rgba(53, 53, 80, 1);`}
		in:slide
	>
		THÁCH THỨC TRÍ TUỆ
	</h1>
</div>
