<script lang="ts">
	import logo from '$lib/image/4t.png';
	import { fade, fly } from 'svelte/transition';
	import { backOut, cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { sendSoundRequest } from '$lib/utils';

	export let screen: 'kd' | 'tt' | 'vcnv' | 'vd';

	const nameMap: Map<'kd' | 'tt' | 'vcnv' | 'vd', { name: string }> = new Map([
		['kd', { name: 'KHỞI ĐỘNG' }],
		['vcnv', { name: 'VƯỢT CHƯỚNG NGẠI VẬT' }],
		['tt', { name: 'TĂNG TỐC' }],
		['vd', { name: 'VỀ ĐÍCH' }]
	]);

	onMount(() => {
		if (screen !== 'kd') sendSoundRequest('start');
		else sendSoundRequest('kd_start');
	});

	function getCharacterWidth(character: string) {
		if (character === ' ') return 1.6;
		else if (['I', 'Í'].includes(character)) return 2;
		return 5.3;
	}
</script>

<div class="fixed h-full w-full bg-bg-3 bg-cover bg-no-repeat" out:fade>
	<img
		class="fixed left-[32.5vw] top-[16vh] w-[35vw]"
		src={logo}
		alt="Logo 4T"
		in:fly|global={{ duration: 2000, y: -200 }}
	/>
	<div
		class="fixed left-1/2 top-[55vh] flex -translate-x-1/2 font-game-display text-[18vh] font-bold italic"
	>
		{#each nameMap.get(screen)?.name ?? '' as character, i}
			<div
				class="text-center"
				style={`font-size: 12vh; width: ${getCharacterWidth(character)}vw; filter: drop-shadow(8px 8px 17px #777);`}
				in:fly|global={{ duration: 2000, delay: 150 * i, y: -200, easing: cubicOut }}
			>
				{character}
			</div>
		{/each}
	</div>
</div>
