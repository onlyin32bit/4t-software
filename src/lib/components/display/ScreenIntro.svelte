<script lang="ts">
	import { sendSoundRequest } from '$lib/utils';
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	export let screen: 'kd' | 'tt' | 'vcnv' | 'vd';

	const scrRec: Record<typeof screen, { name: string; color: string; sound: string }> = {
		'kd': { name: 'KHỞI ĐỘNG', color: 'F58F3E', sound: 'kd_start_2' },
		'vcnv': { name: 'VƯỢT\n CHƯỚNG NGẠI VẬT', color: 'F58F3E', sound: 'vcnv_start' },
		'tt': { name: 'TĂNG TỐC', color: 'D52E29', sound: 'tt_start' },
		'vd': { name: 'VỀ ĐÍCH', color: 'FF0000', sound: 'vd_start' }
	};

	const scr = scrRec[screen];

	onMount(() => {
		sendSoundRequest(scr.sound);
	});
</script>

<div class="fixed w-full h-full bg-no-repeat bg-cover bg-bg-3" in:scale={{ duration: 900 }}>
	<h1
		class="center-element fixed w-screen whitespace-pre-line text-center font-game-display text-[16vh] font-bold"
		style={`-webkit-text-stroke: 1px #fff; color: #${scr.color}; ${screen === 'vd' ? '-webkit-box-reflect: below -9vh linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.2));' : ''}`}
		in:scale={{ delay: 300, duration: 6000 }}
	>
		{scr.name}
	</h1>
</div>
