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
	import { fly, scale, slide } from 'svelte/transition';
	import type { AuthModel, RecordModel } from 'pocketbase';
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import { socket } from '$lib/socket.io-client';

	let thisContestant: RecordModel = {
		collectionId: '',
		collectionName: '',
		id: '',
		created: '',
		updated: ''
	};
	let contestants: RecordModel[] = [];
	let answer: string;
	let answerInputElement: HTMLElement;

	let elapsed: number = 0;
	let bellAllowed: boolean = false;
	let stopTimer: boolean = false;

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
		const displayStatusRecord = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		// const settingsRecord = await pb.collection('settings').getOne('4t-settings-all');

		contestants = userList;
		if ($user) thisContestant = contestants.find(({ id }) => id === $user.id)!;
		current = {
			screen: displayStatusRecord.screen,
			slide: displayStatusRecord.slide,
			question: displayStatusRecord.ques,
			numberOfQues: -1
		};
		bellAllowed = displayStatusRecord.bellAllowed;

		unsub[0] = await pb.collection('users').subscribe('*', ({ action, record }) => {
			if (action === 'update') {
				if (record.id === thisContestant!.id) thisContestant = record;
				// if (record.ring > 0) bellAllowed = false;
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
					if (current.question !== record.ques) current.question = record.ques;
					if (bellAllowed !== record.bellAllowed) bellAllowed = record.bellAllowed;
					if (record.timer !== -1) {
						if (current.screen === 'vcnv' || current.screen === 'tt') {
							console.log('START TIMER: ', record.timer);
							startTimer(record.timer);
						}
					} else if (record.timer === -1) {
						stopTimer = true;
					}
				}
			});
	});

	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	async function createAnswer() {
		if (elapsed === 0) toast.error('Chưa bắt đầu thời gian');
		else if (!/\w/.test(answer)) toast.warning('Chưa nhập câu trả lời');
		else {
			const answerTime = elapsed;
			await pb.collection('users').update(thisContestant.id, {
				answer: answer.toUpperCase(),
				time: answerTime
			});
			toast.success(
				`Đã gửi câu trả lời: [${(answerTime / 1000).toFixed(3)}] ${answer.toUpperCase()}`
			);
			createLogMessage(
				thisContestant.name,
				'ANSWER',
				'[' + (answerTime / 1000).toFixed(3) + ']: ' + answer.toUpperCase()
			);
			answer = '';
		}
	}

	async function startTimer(duration: number) {
		answerInputElement.focus();
		stopTimer = false;
		console.log('start');

		let last_time = window.performance.now();
		let frame;
		(function update() {
			frame = requestAnimationFrame(update);

			const time = window.performance.now();
			elapsed += Math.min(time - last_time, duration - elapsed);
			last_time = time;
			if (elapsed >= duration || stopTimer) {
				cancelAnimationFrame(frame);
				stopTimer = false;
				elapsed = 0;
			}
		})();
	}

	async function ringBell() {
		if (bellAllowed && thisContestant.ring === 0) {
			socket.emit('bell', current.screen, thisContestant.id);
			createLogMessage(thisContestant.name, 'BELL', 'Đã nhấn chuông');
		}
	}
</script>

<svelte:head>
	<title>Trang thí sinh | Thách Thức Trí Tuệ</title>
</svelte:head>

<Toaster />

<AuthCheck>
	<div
		class="grid h-screen select-none grid-cols-1 grid-rows-[50px_50px_1fr_120px] border-[3px] border-gray-400"
	>
		<div class="flex items-center justify-between border-[3px] border-gray-400 px-4">
			<div class="flex items-center gap-8">
				<img class="h-10" src="/src/lib/image/4t-blue.png" alt="Logo 4T" />
				<span class="text-3xl font-semibold">TRANG THÍ SINH - THÁCH THỨC TRÍ TUỆ MÙA 8</span>
			</div>
			<div class="flex items-center gap-4">
				<div>Thí sinh hiện tại: {thisContestant.name} - {thisContestant.class}</div>
				{#if bellAllowed}
					<svg class="h-5" fill="#000" viewBox="0 0 448 512">
						<path
							d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
						/>
					</svg>
				{:else}
					<svg class="h-5" viewBox="0 0 640 512"
						><path
							d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7l-90.2-70.7c.2-.4 .4-.9 .6-1.3c5.2-11.5 3.1-25-5.3-34.4l-7.4-8.3C497.3 319.2 480 273.9 480 226.8l0-18.8c0-77.4-55-142-128-156.8L352 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 19.2c-42.6 8.6-79 34.2-102 69.3L38.8 5.1zM406.2 416L160 222.1l0 4.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S115.4 416 128 416l278.2 0zm-40.9 77.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
						/></svg
					>
				{/if}
			</div>
		</div>
		<div class="grid grid-cols-4">
			{#each contestants as contestant}
				<div
					class="flex items-center justify-between border-[3px] border-gray-400 px-4 text-sm font-semibold lg:text-xl"
					style={`background: #${contestant.ring > 0 ? 'ff7' : 'fff'}`}
				>
					<div class="flex items-center gap-3">
						<span>{contestant.name.toUpperCase()}</span>
						{#if contestant.ring > 0}
							<svg class="h-5 animate-wiggle" fill="#000" viewBox="0 0 448 512" transition:scale>
								<path
									d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
								/>
							</svg>
						{/if}
					</div>
					{#if current.screen.startsWith('answers')}
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
		{#if (current.screen === 'kd' && (current.slide === 'ques_chung' || current.slide === 'test_bell')) || current.screen === 'vd'}
			<button
				class=" font-mono select-none border-[3px] border-gray-400 text-center text-6xl hover:bg-red-100"
				on:click|preventDefault={ringBell}
				><div class="flex flex-col items-center gap-4">
					<svg class="w-10" viewBox="0 0 448 512"
						><path
							d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
						/></svg
					>
					<div class="flex flex-col">NHẤN CHUÔNG</div>
				</div></button
			>
		{:else if current.screen === 'vcnv' || current.screen === 'tt'}
			<div class="grid grid-cols-5">
				<div class="col-span-4 grid grid-rows-[1fr_100px] text-6xl">
					<div class="border-[3px] border-gray-400">
						<div></div>
					</div>
					<div class="grid grid-cols-[1fr_12rem] grid-rows-[2rem_1fr] border-[3px] border-gray-400">
						<div class="px-4 text-2xl">Câu trả lời đã gửi:</div>
						<div class="font-mono row-span-2 flex items-center justify-center font-bold">
							{formatTime2(thisContestant.time)}
						</div>
						<div class="flex items-center px-4 text-5xl font-semibold">{thisContestant.answer}</div>
					</div>
				</div>
				<div class="grid grid-rows-2">
					<div
						class="font-mono flex flex-col items-center justify-center gap-4 border-[3px] border-gray-400 text-6xl font-semibold"
					>
						<span class="text-xl">Thời gian:</span>
						{#if elapsed === 0}
							<span class="text-center text-5xl font-medium">Đã hết thời gian</span>
						{:else}
							<span>{(elapsed / 1000).toFixed(2)}s</span>
						{/if}
					</div>
					<div class="select-none border-[3px] border-gray-400">
						{#if ['main_vcnv', 'image_vcnv', 'ques'].includes(current.slide) && current.screen !== 'tt'}
							<button
								class="font-mono h-full text-center text-6xl hover:bg-red-100"
								on:click|preventDefault={ringBell}
								><div class="flex flex-col items-center gap-4">
									<svg class="w-10" viewBox="0 0 448 512"
										><path
											d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
										/></svg
									>
									<div class="flex flex-col">NHẤN CHUÔNG</div>
								</div></button
							>
						{/if}
					</div>
				</div>
			</div>
			<div class="border-[3px] border-gray-400">
				<form on:submit|preventDefault={createAnswer} class="h-full">
					<input
						class="h-full w-full px-4 text-6xl uppercase"
						type="text"
						placeholder="Nhập câu trả lời của bạn, ENTER để gửi"
						bind:value={answer}
						bind:this={answerInputElement}
					/>
				</form>
			</div>
		{/if}
	</div>
</AuthCheck>
