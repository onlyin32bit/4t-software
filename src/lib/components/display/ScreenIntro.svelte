<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	export let screen: 'kd' | 'tt' | 'vcnv' | 'vd';

	const nameMap: Map<string, { name: string; color: string }> = new Map([
		['kd', { name: 'KHỞI ĐỘNG', color: 'FFC000' }],
		['vcnv', { name: 'VƯỢT CHƯỚNG NGẠI VẬT', color: 'F58F3E' }],
		['tt', { name: 'TĂNG TỐC', color: 'D52E29' }],
		['vd', { name: 'VỀ ĐÍCH', color: 'FF0000' }]
	]);
</script>

<div
	class="fixed h-full w-full bg-bg-3 bg-cover bg-no-repeat"
	in:scale={{ duration: 4000 }}
	out:fade
>
	<h1
		class="center-element fixed w-3/4 text-center font-game-display text-[15vh] font-semibold"
		style={`-webkit-text-stroke: 2px #fff; color: #${nameMap.get(screen)?.color};`}
		in:scale={{ duration: 5000 }}
	>
		{nameMap.get(screen)?.name}
	</h1>
</div>
