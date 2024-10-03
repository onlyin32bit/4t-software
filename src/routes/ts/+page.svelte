<script lang="ts">
	import { dictionary, timerSettings, createLogMessage } from '$lib/utils';
	import { user, pb } from '$lib/pocketBase';
	import { onMount, onDestroy } from 'svelte';

	let userStats: any = $user;
	let contestants: any[] = [];
	let answer: string;
	let time: number = 0;
	$: timerSetting = (timerSettings.get(current.screen) ?? 0) * 1000;

	type DisplayObject = {
		screen: string;
		slide: string;
		question: number;
		numberOfQues: number;
	};

	let current: DisplayObject = {
		screen: '',
		slide: '',
		question: -1,
		numberOfQues: -1
	};

	let unsub: (() => void)[] = [];
	onMount(async () => {
		const userList = await pb.collection('users').getFullList();
		const displayStatus = await pb.collection('display_status').getOne('4t-displaystate');

		contestants = userList;
		current = {
			screen: displayStatus.screen,
			slide: displayStatus.slide,
			question: displayStatus.ques,
			numberOfQues: -1
		};

		unsub[0] = await pb.collection('users').subscribe($user?.id, ({ action, record }) => {
			if (action == 'update') {
				userStats = record;
			}
		});
		unsub[1] = await pb.collection('users').subscribe('*', ({ action, record }) => {
			// console.log(record);
			if (action === 'update') {
				contestants = contestants.map((currentValue) => {
					if (currentValue.username === record.username) {
						return record;
					} else {
						return currentValue;
					}
				});
			}
		});
		unsub[2] = await pb.collection('display_status').subscribe('*', ({ action, record }) => {
			if (action === 'update') {
				console.log(record);
				current.screen = record.screen;
				current.slide = record.slide;
				current.question = record.ques;
			}
		});
	});
	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});
	$: if (userStats?.time == -1) timer();

	async function timer() {
		time = timerSetting;
		let countdown: any = setInterval(() => {
			time -= 10;
			if (time <= 0) {
				clearInterval(countdown);
				countdown = null;
				answer = '';
			}
		}, 10);
	}

	async function createAnswer() {
		if (userStats.time == -1) {
			await pb.collection('users').update(userStats.id, {
				answer: answer.toUpperCase(),
				time: timerSetting - time
			});
			alert('Da gui cau tra loi');
		} else {
			alert('Chua bat dau thoi gian');
		}
	}
</script>

<svelte:head>
	<title>Trang thí sinh | Thách Thức Trí Tuệ</title>
</svelte:head>

<div class="grid h-screen grid-cols-1 grid-rows-[50px_1fr_120px] border-[3px] border-gray-400">
	<div class="grid grid-cols-4">
		{#each contestants as contestant}
			<div
				class="flex items-center justify-between border-[3px] border-gray-400 px-4 text-sm font-semibold lg:text-xl"
			>
				<span>{contestant.name.toUpperCase()}</span>
				<span>{contestant.score}</span>
			</div>
		{/each}
	</div>
	<div class="border-[3px] border-gray-400">ques</div>
	<div class="grid grid-cols-[1fr_50px] items-center border-[3px] border-gray-400">
		<form on:submit|preventDefault={createAnswer} class="flex h-full items-center pr-4">
			<input
				class="h-full w-full px-4 text-6xl uppercase"
				type="text"
				placeholder="Nhập câu trả lời của bạn, ENTER để gửi"
				bind:value={answer}
			/>
		</form>
		<div>
			<span>{(time / 1000).toFixed(2)}s</span>
			{#if current.screen === 'vcnv'}
				<button>BELL</button>
			{/if}
		</div>
	</div>
</div>
