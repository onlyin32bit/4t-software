<script lang="ts">
	import logo from '$lib/image/4t.png';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { sendSoundRequest } from '$lib/utils';
	import { zoomIn } from '$lib/transitions';
	import Particles, { particlesInit } from '@tsparticles/svelte';
	import { loadSlim } from '@tsparticles/slim';

	export let screen: 'kd' | 'tt' | 'vcnv' | 'vd';

	const nameMap: Map<'kd' | 'tt' | 'vcnv' | 'vd', { name: string }> = new Map([
		['kd', { name: 'KHỞI ĐỘNG' }],
		['vcnv', { name: 'VƯỢT CHƯỚNG NGẠI VẬT' }],
		['tt', { name: 'TĂNG TỐC' }],
		['vd', { name: 'VỀ ĐÍCH' }]
	]);

	let particlesConfig = {
		particles: {
			number: {
				value: 120
			},
			color: {
				value: '#ffffff'
			},
			shape: {
				type: 'circle',
				stroke: {
					width: 0,
					color: '#000000'
				},
				image: {
					width: 100,
					height: 100
				}
			},
			opacity: {
				value: {
					min: 0.2,
					max: 1
				},
				anim: {
					enable: true,
					speed: 2,
					sync: false
				}
			},
			size: {
				value: 4,
				random: true
			},
			move: {
				enable: true,
				speed: 3,
				direction: 'none' as 'none',
				random: true,
				straight: false,
				out_mode: 'out',
				bounce: true
			}
		}
	};

	let onParticlesLoaded = (event: any) => {
		const particlesContainer = event.detail.particles;
	};

	onMount(() => {
		if (screen !== 'kd') sendSoundRequest('start');
		else sendSoundRequest('kd_start');
	});

	void particlesInit(async (engine) => {
		await loadSlim(engine);
	});

	function getCharacterWidth(character: string) {
		if (character === ' ') return 1.6;
		else if (['I', 'Í'].includes(character)) return 2;
		return 5.3;
	}
</script>

<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat" out:fade>
	<Particles
		id="tsparticles"
		class="h-screen w-screen"
		style=""
		options={particlesConfig}
		on:particlesLoaded={onParticlesLoaded}
	/>
	<img
		class="fixed left-[32.5vw] top-[15vh] w-[35vw]"
		style={`filter: drop-shadow(8px 10px 1vh #337);`}
		src={logo}
		alt="Logo 4T"
		in:fly|global={{ duration: 3000, y: -600, opacity: 0.7 }}
	/>

	<div
		class="fixed left-1/2 top-[58vh] flex font-game-display text-[18vh] font-bold"
		style={`${screen === 'vcnv' ? 'transform: translate(-50%,0)' : 'transform: scale(1.4) translate(-35%,0)'}`}
	>
		{#each nameMap.get(screen)?.name ?? '' as character, i}
			<div
				class="text-center"
				style={`font-size: 12vh; width: ${getCharacterWidth(character)}vw; filter: drop-shadow(0.1vh 0.2vh 1vh #337);`}
				in:zoomIn|global={{ duration: 900 + (screen === 'vcnv' ? 0 : 500), delay: 150 * i }}
			>
				{character}
			</div>
		{/each}
	</div>
</div>
