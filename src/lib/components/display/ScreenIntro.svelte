<script lang="ts">
	import { sendSoundRequest } from '$lib/utils';
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	export let screen: 'kd' | 'tt' | 'vcnv' | 'vd';

	const nameMap: Map<string, { name: string; color: string; sound: string }> = new Map([
		['kd', { name: 'KHỞI ĐỘNG', color: 'FFC000', sound: 'kd_start_2' }],
		['vcnv', { name: 'VƯỢT CHƯỚNG NGẠI VẬT', color: 'F58F3E', sound: 'vcnv_start' }],
		['tt', { name: 'TĂNG TỐC', color: 'D52E29', sound: 'tt_start' }],
		['vd', { name: 'VỀ ĐÍCH', color: 'FF0000', sound: 'vd_start' }]
	]);

	onMount(() => {
		sendSoundRequest(nameMap.get(screen)?.sound ?? '');
	});
</script>

<div class="fixed h-full w-full bg-bg-3 bg-cover bg-no-repeat" in:scale={{ duration: 1700 }}>
	<h1
		class="center-element fixed w-3/4 text-center font-game-display text-[15vh] font-semibold"
		style={`-webkit-text-stroke: 2px #fff; color: #${nameMap.get(screen)?.color}; ${screen === 'vd' ? '-webkit-box-reflect: below -9vh linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.4));' : ''}`}
		in:scale={{ delay: 300, duration: 6000 }}
	>
		{nameMap.get(screen)?.name}
	</h1>
</div>
