<script lang="ts">
	import {
		dictionary,
		timerSettings,
		createLogMessage,
		playSound,
		sendSoundRequest,
		formatTime2
	} from '$lib/utils';
	import { user, pb } from '$lib/pocketBase';
	import { onMount, onDestroy } from 'svelte';
	import { Toaster, toast } from 'svelte-sonner';
	import { fly } from 'svelte/transition';
	import type { AuthModel } from 'pocketbase';

	let thisUser: NonNullable<AuthModel> = $user ?? {};
	let contestants: NonNullable<AuthModel>[] = [];
	let answer: string;
	let elapsed: number = 0;
	let timer: number = -1;

	let inputFocus: boolean = false;

	let current: {
		screen: string;
		slide: string;
		question: number;
		numberOfQues: number;
	} = {
		screen: '',
		slide: '',
		question: -1,
		numberOfQues: -1
	};

	let unsub: (() => void)[] = [];
	onMount(async () => {
		const userList = await pb.collection('users').getFullList();
		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		// const settingsRecord = await pb.collection('settings').getOne('4t-settings-all');

		contestants = userList;
		current = {
			screen: displayStatus.screen,
			slide: displayStatus.slide,
			question: displayStatus.ques,
			numberOfQues: -1
		};

		unsub[0] = await pb.collection('users').subscribe('*', ({ action, record }) => {
			if (action === 'update') {
				if (record.id === thisUser!.id) thisUser = record;
				contestants = contestants.map((currentValue) =>
					currentValue.id === record.id ? record : currentValue
				);
			}
		});
		unsub[1] = await pb
			.collection('display_status')
			.subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
				if (action === 'update') {
					current.screen = record.screen;
					current.slide = record.slide;
					current.question = record.ques;
					if (record.timer !== timer) timer = record.timer;
					if (timer !== -1) startTimer(timer);
				}
			});
	});

	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	async function createAnswer() {
		if (timer === -1) toast.error('Chưa bắt đầu thời gian');
		else if (!/\w/.test(answer)) toast.warning('Chưa nhập câu trả lời');
		else {
			const answerTime = elapsed;
			await pb.collection('users').update(thisUser.id, {
				answer: answer.toUpperCase(),
				time: answerTime
			});
			toast.success(
				`Đã gửi câu trả lời: [${(answerTime / 1000).toFixed(3)}] ${answer.toUpperCase()}`
			);
			createLogMessage(
				thisUser.name,
				'ANSWER',
				'[' + (answerTime / 1000).toFixed(3) + ']: ' + answer.toUpperCase()
			);
			answer = '';
		}
	}

	async function startTimer(duration: number) {
		let last_time = window.performance.now();
		let frame;
		(function update() {
			frame = requestAnimationFrame(update);

			const time = window.performance.now();
			elapsed += Math.min(time - last_time, duration - elapsed);
			last_time = time;
			if (elapsed >= duration) {
				cancelAnimationFrame(frame);

				elapsed = 0;
			}
		})();
	}

	async function ringBell() {
		// if (current.screen === 'vcnv' || current.screen === 'vd') {
		if (thisUser.ring === 0) {
			await pb.collection('users').update(thisUser.id, {
				ring: 1
			});
			toast.success('Đã nhấn chuông');
			createLogMessage(thisUser.name, 'BELL', 'Đã nhấn chuông');
			// playSound('bell_vd');
			sendSoundRequest('bell_vd');
		} else {
			toast.warning('Chuông đã được nhấn');
		}
		// } else {
		// 	toast.warning('Chưa được nhấn chuông');
		// }
	}
</script>

<svelte:head>
	<title>Trang thí sinh | Thách Thức Trí Tuệ</title>
</svelte:head>

<svelte:window
	on:keydown={(e) => {
		if (e.key === ' ' && !inputFocus) ringBell();
	}}
/>

<Toaster expand={true} richColors closeButton position="top-right" />

<div class="grid h-screen grid-cols-1 grid-rows-[50px_50px_1fr_120px] border-[3px] border-gray-400">
	<div class="flex items-center justify-center gap-8 border-[3px] border-gray-400">
		<img class="h-10" src="/src/lib/image/4t-blue.png" alt="Logo 4T" />
		<span class="text-3xl font-semibold">THÁCH THỨC TRÍ TUỆ - MÙA 8</span>
	</div>
	<div class="grid grid-cols-4">
		{#each contestants as contestant}
			<div
				class="flex items-center justify-between border-[3px] border-gray-400 px-4 text-sm font-semibold lg:text-xl"
			>
				<span>{contestant.name.toUpperCase()}</span>
				{#if current.screen === 'answers'}
					<span class="text-[1rem] font-medium tracking-tighter">{contestant.answer}</span>
				{:else}
					<div>
						{#key contestant.score}
							<span class="font-mono font-bold" out:fly={{ y: -20 }}>
								{contestant.score}
							</span>
						{/key}
					</div>
				{/if}
			</div>
		{/each}
	</div>
	<div class="grid grid-cols-5">
		<div class="col-span-4 grid grid-rows-[1fr_100px] text-6xl">
			<div class="border-[3px] border-gray-400">
				<div>:))))))))))</div>
			</div>
			<div class="grid grid-cols-[1fr_12rem] grid-rows-2">
				<div class="text-2xl">Câu trả lời đã gửi:</div>
				<div class="row-span-1">{formatTime2(thisUser.time)}</div>
				<div class="col-span-2">{thisUser.answer}</div>
			</div>
		</div>
		<div class="grid grid-rows-2">
			<div
				class="flex flex-col items-center justify-center gap-4 border-[3px] border-gray-400 font-mono text-6xl font-semibold"
			>
				<span class="text-xl">Thời gian:</span>
				{#if timer === -1}
					<span class="text-2xl font-medium">Chưa bắt đầu</span>
				{:else}
					<span>{(elapsed / 1000).toFixed(2)}s</span>
				{/if}
			</div>
			<button
				class="select-none border-[3px] border-gray-400 text-center font-mono text-6xl hover:bg-red-100"
				on:click|preventDefault={ringBell}
				><div class="flex flex-col items-center gap-4">
					<svg class="w-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
						><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path
							d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
						/></svg
					>
					<div class="flex flex-col">
						NHẤN CHUÔNG
						<span class="text-xl font-thin">Có thể nhấn phím cách</span>
					</div>
				</div></button
			>
		</div>
	</div>
	<div class="border-[3px] border-gray-400">
		<form on:submit|preventDefault={createAnswer} class="h-full">
			<input
				class="h-full w-full px-4 text-6xl uppercase"
				type="text"
				placeholder="Nhập câu trả lời của bạn, ENTER để gửi"
				on:focusin={() => {
					inputFocus = true;
				}}
				on:focusout={() => {
					inputFocus = false;
				}}
				bind:value={answer}
			/>
		</form>
	</div>
</div>
