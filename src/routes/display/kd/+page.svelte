<script lang="ts">
	import { goto } from '$app/navigation';
	import { timerSettings } from '$lib/utils';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';

	let questions: string[] = [];
	let screen: string = 'kd';
	let slide: string = 'start';
	let ques: number = 1;
	let time: number = 0;
	const timerSetting = (timerSettings.get('kd') ?? 0) * 1000;
	let unsub: (() => void)[] = [];

	onMount(async () => {
		const displayStatus = await pb.collection('display_status').getOne('4t-displaystate');
		screen = displayStatus.screen;
		slide = displayStatus.slide;
		ques = displayStatus.ques;

		const questionList = await pb.collection('ques_kd').getOne('4t-questions-kd');
		questions = questionList.question;

		unsub[0] = await pb.collection('display_status').subscribe('*', ({ action, record }) => {
			if (action === 'update') {
				screen = record.screen;
				slide = record.slide;
				ques = record.ques;
			}
		});
		unsub[1] = await pb.collection('users').subscribe('', ({ action, record }) => {
			if (action == 'update') {
			}
		});
	});

	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	async function timer() {
		time = timerSetting;
		let countdown: any = setInterval(() => {
			time -= 10;
			if (time <= 0) {
				clearInterval(countdown);
				countdown = null;
			}
		}, 10);
	}

	$: if (screen != 'kd') {
		goto('/display/' + screen);
	}
	$: if (time === -1) timer();
</script>

<div class="flex h-screen w-screen items-center justify-center bg-black">
	<div class="aspect-[3/2] h-screen">
		{#if slide === 'ques'}
			<div class="h-full bg-bg-2 bg-contain">
				<div
					class="relative flex h-[80vh] w-[70vw] items-center justify-center bg-bg-kd bg-contain bg-no-repeat text-white"
				>
					<div class=" absolute left-[3.5rem] top-12 text-[5rem] text-black">
						<h1 class="absolute -top-2 left-[85px] z-10 -translate-x-1/2 font-semibold">
							{ques}
						</h1>

						<svg
							viewBox="120.1768 147.8736 180.81 100.508"
							width="170"
							height="100.508"
							xmlns="http://www.w3.org/2000/svg"
						>
							<defs>
								<linearGradient
									gradientUnits="userSpaceOnUse"
									x1="214.059"
									y1="125.108"
									x2="214.059"
									y2="298.964"
									id="gradient-0"
									gradientTransform="matrix(-0.006687, 1.039962, -0.563925, -0.006394, 335.481662, -7.830753)"
								>
									<stop offset="0" style="stop-color: rgb(122, 182, 255);"></stop>
									<stop offset="1" style="stop-color: rgb(235, 248, 255);"></stop>
								</linearGradient>
								<linearGradient
									gradientUnits="userSpaceOnUse"
									x1="214.059"
									y1="125.108"
									x2="214.059"
									y2="298.964"
									id="gradient-1"
									gradientTransform="matrix(-0.007065, 1.039938, -0.556694, 0.000375, 333.4009, -13.187421)"
								>
									<stop offset="0" style="stop-color: rgb(122, 214, 255);"></stop>
									<stop offset="1" style="stop-color: rgb(242, 242, 242);"></stop>
								</linearGradient>
							</defs>
							<path
								d="M 214.059 121.631 L 264.313 166.834 L 264.313 257.239 L 214.059 302.441 L 163.805 257.239 L 163.805 166.834 Z"
								style="fill-rule: nonzero; paint-order: fill; fill: url('#gradient-0'); stroke: url('#gradient-1'); stroke-opacity: 0.93; stroke-width: 5px; transform-origin: 214.059px 212.036px;"
								transform="matrix(0, 1, -1, 0, -3.477165464644, -13.908370674935)"
							></path>
						</svg>
					</div>
					<p class="w-[80%] text-center text-[4rem] font-medium leading-[5rem]">
						{questions[ques - 1]}
					</p>
				</div>
				<h1 class="text-[7rem]">{((timerSetting - time) / 1000).toFixed(0)}</h1>
			</div>
		{:else}
			<div class="h-full bg-bg-1 bg-contain"></div>
		{/if}
	</div>
</div>
