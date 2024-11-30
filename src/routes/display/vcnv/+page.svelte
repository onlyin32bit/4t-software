<script lang="ts">
	import { fly, fade, scale, slide } from 'svelte/transition';
	import logo from '$lib/image/4t.png';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import type { RecordModel } from 'pocketbase';
	import { onDestroy, onMount } from 'svelte';
	import ScreenIntro from '$lib/components/display/ScreenIntro.svelte';
	import ScreenRule from '$lib/components/display/ScreenRule.svelte';
	import ScreenStart from '$lib/components/display/ScreenStart.svelte';
	import ScreenQuestionVcnv from '$lib/components/display/ScreenQuestionVCNV.svelte';

	let questionSet: RecordModel;
	let obstacle: string = '';
	let imageLink: string = pb.baseUrl + '/api/files/vcnv/4T-QUES-VCNV-BK/';
	let rows: { keyword: string; question: string }[] = [];
	let centerQuestion: string = '';
	let scr_slide: string = 'start';
	let ques: number = 1;
	let start: boolean = false;
	let displayed: {
		obstacle: boolean;
		rows: Array<string>;
		image: Array<boolean>;
	} = {
		obstacle: false,
		rows: ['', '', '', ''],
		image: [false, false, false, false, false]
	};
	let time: number = 0;
	let displayQuestion: boolean = false;
	let contestantBell: string[] = [];

	// let unsub: (() => void)[] = [];
	onMount(async () => {
		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		screen = displayStatus.screen;
		scr_slide = displayStatus.slide;
		ques = displayStatus.ques;

		const displayStatusVcnv = await pb.collection('display_status_vcnv').getOne('4T-DISPLAYSTATE');
		start = displayStatusVcnv.start;
		displayed = {
			obstacle: displayStatusVcnv.obstacle,
			rows: [
				displayStatusVcnv[1],
				displayStatusVcnv[2],
				displayStatusVcnv[3],
				displayStatusVcnv[4]
			],
			image: [
				displayStatusVcnv['h1'],
				displayStatusVcnv['h2'],
				displayStatusVcnv['h3'],
				displayStatusVcnv['h4'],
				displayStatusVcnv['center']
			]
		};

		const data = await pb.collection('vcnv').getOne('4T-QUES-VCNV-BK');
		questionSet = data.question;
		obstacle = questionSet.obstacle ?? '';
		imageLink += data.image;
		rows = questionSet.rows ?? [];
		centerQuestion = questionSet.center_ques;

		// unsub = [
		await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
			if (action === 'update') {
				if (record.screen !== 'vcnv') goto('/display/' + record.screen);
				if (scr_slide !== record.slide) scr_slide = record.slide;
				if (ques !== record.ques) ques = record.ques;
				displayQuestion = record.displayQuestion;
				if (record.timer !== -1 && scr_slide === 'main_vcnv') timer();
			}
		});
		await pb
			.collection('display_status_vcnv')
			.subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
				if (action === 'update') {
					if (start !== record.start) start = record.start;
					displayed = {
						obstacle: record.obstacle,
						rows: [record[1], record[2], record[3], record[4]],
						image: [record['h1'], record['h2'], record['h3'], record['h4'], record['center']]
					};
				}
			});
		await pb.collection('users').subscribe('*', ({ action, record }) => {
			if (action === 'update' && record.ring > 0) contestantBell = [...contestantBell, record.name];
		});
		// ];
	});
	onDestroy(() => {
		pb.collection('display_status').unsubscribe('4T-DISPLAYSTATE');
		pb.collection('display_status_vcnv').unsubscribe('4T-DISPLAYSTATE');
		pb.collection('users').unsubscribe('*');
	});

	async function timer() {
		let countdown: any = setInterval(() => {
			time += 0.01;
			if (time >= 15) {
				clearInterval(countdown);
				countdown = null;
				time = 15;
			}
		}, 10);
	}

	function getRowBackgroundColor(state: string) {
		if (state === 'selected' || state === 'correct') return 'aaf';
		if (state === 'wrong') return 'aaa';
		return '05259f';
	}
</script>

{#if scr_slide === 'start'}
	<ScreenStart />
{:else if scr_slide === 'rule'}
	<ScreenRule screen="vcnv" />
{:else if scr_slide === 'intro'}
	<ScreenIntro screen="vcnv" />
{:else if scr_slide === 'main_vcnv'}
	<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat">
		<div class="relative -left-[5vw] -top-[3vh] h-full w-full">
			<div in:fade>
				<img
					class="absolute left-1/2 top-1/2 h-[95vh] w-[90vw] -translate-x-1/2 -translate-y-1/2"
					style={`filter: drop-shadow(8px 28px 32px #335);`}
					src="/src/lib/image/bg2.svg"
					alt=""
				/>
				<img
					class="absolute left-1/2 top-1/2 h-[45vh] -translate-x-1/2 -translate-y-1/2 opacity-15"
					src={logo}
					alt=""
				/>
			</div>
			{#if start}
				<div
					class="absolute left-2/3 top-[10vh] w-[75vw] -translate-x-3/4 bg-white text-center text-[8vh] font-bold text-black"
					style="clip-path: polygon(98% 0, 100% 50%, 98% 99%, 2% 100%, 0 53%, 2% 0);"
					in:scale={{ duration: 900 }}
				>
					{#if displayed.obstacle}
						<h1 in:scale>CNV: {obstacle}</h1>
					{:else}
						<h1>CHƯỚNG NGẠI VẬT CÓ {obstacle.replaceAll(' ', '').length} KÍ TỰ</h1>
					{/if}
				</div>
				<div
					class="absolute left-1/2 top-2/3 flex -translate-x-[45%] -translate-y-3/4 flex-col gap-[4vh]"
					in:fade={{ duration: 1000 }}
				>
					{#each rows as row, i}
						<div class="relative">
							<div
								class="absolute left-[-7vw] flex h-[10vh] w-[10vh] items-center justify-center rounded-[3vh] border-8 border-[#083b7b] bg-gradient-to-t from-[#0a357c] to-[#395693] text-[6vh] font-bold"
							>
								{i + 1}
							</div>
							<div class="flex justify-center gap-[0.5vh]">
								{#each row.keyword as character}
									<div
										class="flex size-[10vh] items-center justify-center rounded-full border-8 text-[7vh] font-extrabold text-blue-950"
										style={`background: radial-gradient(circle at 45% 43%, #fff, #${getRowBackgroundColor(displayed.rows[i])});
												box-shadow: 4px 4px 1px rgba(0, 0, 0, 0.6), 5px 5px 3px #fff, inset 2px 2px 5px rgba(0, 0, 0, 0.8);
												filter: brightness(${displayed.rows[i] === 'wrong' ? '0.65' : '1.1'});
												// -webkit-text-stroke: 4px #879;
												`}
									>
										{displayed?.rows[i] === 'correct' ? character : ''}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<div
			class="fixed bottom-[13.5vh] right-[3.5vw] h-[75vh] w-[6vw] bg-white outline-8"
			style={`filter: drop-shadow(8px 28px 32px #335);`}
			in:fade
		>
			<div
				class="absolute bottom-0 w-full bg-red-700"
				style={`height: ${(time / 15) * 100}%;`}
			></div>
		</div>
		<div class="fixed bottom-[2.5vh] left-[2.5vw] flex gap-[2vw] text-[6vh] font-bold">
			{#each contestantBell as contestant, i (i)}
				<div
					class="flex items-center justify-center gap-[1vw] rounded-[1vh] border-[0.7vh] bg-gradient-to-tr from-[#0F247D] to-[#26164D] px-[1vw]"
					in:fly={{ x: 100 }}
				>
					<svg class="h-[5vh] animate-wiggle" fill="#fff" viewBox="0 0 448 512">
						<path
							d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
						/>
					</svg>
					{contestant}
				</div>
			{/each}
		</div>
	</div>
{:else if scr_slide === 'image_vcnv'}
	<div class="h-full w-full text-[20vh] font-bold">
		<img class="fixed left-1/2 h-screen -translate-x-1/2" src={imageLink} alt="" />
		{#if !displayed.image[0]}
			<div
				class="fixed right-0 h-[50vh] w-[50vw] border-8 bg-gradient-to-tr from-[#0F247D] to-[#26164D]"
			>
				<h1 class="absolute right-[11vw] top-[5vh]">1</h1>
			</div>
		{/if}
		{#if !displayed.image[1]}
			<div
				class="fixed left-0 h-[50vh] w-[50vw] border-8 bg-gradient-to-tr from-[#0F247D] to-[#26164D]"
			>
				<h1 class="absolute left-[11vw] top-[5vh]">2</h1>
			</div>
		{/if}
		{#if !displayed.image[2]}
			<div
				class="fixed bottom-0 right-0 h-[50vh] w-[50vw] border-8 bg-gradient-to-tr from-[#0F247D] to-[#26164D]"
			>
				<h1 class="absolute bottom-[7vh] right-[11vw]">3</h1>
			</div>
		{/if}
		{#if !displayed.image[3]}
			<div
				class="fixed bottom-0 left-0 h-[50vh] w-[50vw] border-8 bg-gradient-to-tr from-[#0F247D] to-[#26164D]"
			>
				<h1 class="absolute bottom-[7vh] left-[11vw]">4</h1>
			</div>
		{/if}

		{#if !displayed.image[4]}
			<div
				class="fixed left-1/2 top-1/2 h-[45vh] w-[45vw] -translate-x-1/2 -translate-y-1/2 border-[16px] bg-gradient-to-tr from-[#0F247D] to-[#26164D]"
			></div>
		{/if}
	</div>
{:else if scr_slide === 'ques'}
	<ScreenQuestionVcnv
		questionNumber={ques}
		question={ques < 5 ? rows[ques - 1]?.question : centerQuestion}
		{displayQuestion}
		{contestantBell}
	/>
{/if}
