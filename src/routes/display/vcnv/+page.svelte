<script lang="ts">
	import logo from '$lib/image/4t.png';
	import ScreenIntro from './../../../lib/components/display/ScreenIntro.svelte';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import type { RecordModel } from 'pocketbase';
	import { onDestroy, onMount } from 'svelte';
	import ScreenRule from '$lib/components/display/ScreenRule.svelte';
	import ScreenStart from '$lib/components/display/ScreenStart.svelte';

	let questionSet: RecordModel;
	let obstacle: string = '';
	let rows: any[] = [];
	let screen: string = 'vcnv';
	let slide: string = 'start';
	let ques: number = 1;
	let displayed: {
		obstacle: boolean;
		rows: Array<string>;
	} = {
		obstacle: false,
		rows: ['unselected', 'unselected', 'unselected', 'unselected']
	};
	let displayQuestion: boolean = false;

	let unsub: (() => void)[] = [];

	onMount(async () => {
		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		screen = displayStatus.screen;
		slide = displayStatus.slide;
		ques = displayStatus.ques;
		displayed = displayStatus.displayed.vcnv;
		console.log(displayed);

		const data = await pb.collection('vcnv').getOne('4T-QUES-VCNV-BK');
		questionSet = data.question;
		obstacle = questionSet.obstacle ?? '';
		rows = questionSet.rows ?? [];

		unsub = [
			await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
				if (action === 'update') {
					screen = record.screen;
					slide = record.slide;
					ques = record.ques;
					if (JSON.stringify(displayed) !== JSON.stringify(record.displayed.vcnv))
						displayed = record.displayed.vcnv;
					if (displayQuestion !== record.displayQuestion) displayQuestion = true;
				}
			})
		];
	});

	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	function getRowBackgroundColor(state: string) {
		if (state === 'selected' || state === 'correct') return 'aaf';
		if (state === 'wrong') return 'aaa';

		return '025ebf';
	}

	$: {
		ques;
		displayQuestion = false;
	}

	$: if (screen != 'vcnv') goto('/display/' + screen);
</script>

<div class="pointer-events-none h-screen w-screen select-none bg-black text-white">
	{#if slide === 'start'}
		<ScreenStart />
	{:else if slide === 'rule'}
		<ScreenRule screen="vcnv" />
	{:else if slide === 'intro'}
		<ScreenIntro screen="vcnv" />
	{:else if slide === 'main_vcnv'}
		<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat">
			<div class="flex w-full justify-around bg-[#c23a37] py-[1.5vh] text-[8vh] font-bold">
				<img class="h-[12vh]" src={logo} alt="Logo 4T" />
				<h1>CHƯỚNG NGẠI VẬT CÓ {obstacle.replaceAll(' ', '').length} KÍ TỰ</h1>
			</div>
			<div
				class="fixed left-1/2 top-2/3 flex -translate-x-1/2 -translate-y-2/3 flex-col gap-[3.2vh]"
			>
				{#each rows as row, i}
					<div class="flex justify-start gap-[1vh]">
						{#each row.keyword as character}
							<div
								class="flex h-[12vh] w-[12vh] items-center justify-center rounded-full border-8 text-[9vh] font-bold text-blue-950"
								style={`background: radial-gradient(circle at 45% 43%, #fff, #${getRowBackgroundColor(displayed.rows[i])});
										box-shadow: 4px 4px 1px rgba(0, 0, 0, 0.6), 5px 5px 3px #fff, inset 2px 2px 5px rgba(0, 0, 0, 0.8);
										filter: brightness(${displayed.rows[i] === 'wrong' ? '0.7' : '1.1'});`}
							>
								{displayed?.rows[i] === 'correct' ? character : ''}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	{:else if slide === 'image_vcnv'}
		<div></div>
	{/if}
</div>
