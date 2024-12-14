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
	import type { AuthModel } from 'pocketbase';
	import AuthCheck from '$lib/components/AuthCheck.svelte';

	let thisContestant: NonNullable<AuthModel> = $user ?? {};
	let contestants: NonNullable<AuthModel>[] = [];
	let answer: string;
	let answerInputElement: HTMLElement;

	let elapsed: number = 0;
	let timer: number = -1;
	let bellAllowed: boolean = true;

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
				if (record.id === thisContestant!.id) thisContestant = record;
				if (record.bell > 0) bellAllowed = false;
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

					// if (record.timer !== timer) timer = record.timer;
					if (record.timer !== -1) {
						console.log('START TIMER: ', record.timer);
						startTimer(record.timer);
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
		console.log('start');

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
		if (bellAllowed)
			if (thisContestant.ring === 0) {
				await pb.collection('users').update(thisContestant.id, {
					ring: 1
				});
				// toast.success('Đã nhấn chuông');
				createLogMessage(thisContestant.name, 'BELL', 'Đã nhấn chuông');
				sendSoundRequest('bell_' + current.screen);
			} else {
				toast.warning('Chuông đã được nhấn');
			}
		else toast.warning('Chưa được nhấn chuông');
	}
</script>

<svelte:head>
	<title>Trang thí sinh | Thách Thức Trí Tuệ</title>
</svelte:head>

<Toaster></Toaster>

<AuthCheck>
	<div
		class="grid h-screen grid-cols-1 grid-rows-[50px_50px_1fr_120px] border-[3px] border-gray-400"
	>
		<div class="flex items-center justify-between border-[3px] border-gray-400 px-4">
			<div class="flex items-center gap-8">
				<img class="h-10" src="/src/lib/image/4t-blue.png" alt="Logo 4T" />
				<span class="text-3xl font-semibold">TRANG THÍ SINH - THÁCH THỨC TRÍ TUỆ MÙA 8</span>
			</div>
			<div>Thí sinh hiện tại: {thisContestant.name} - {thisContestant.class}</div>
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
				class=" select-none border-[3px] border-gray-400 text-center font-mono text-6xl hover:bg-red-100"
				on:click|preventDefault={ringBell}
				class:btn-disabled={!bellAllowed}
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
						<div class="row-span-2 flex items-center justify-center font-mono font-bold">
							{formatTime2(thisContestant.time)}
						</div>
						<div class="flex items-center px-4 text-5xl font-semibold">{thisContestant.answer}</div>
					</div>
				</div>
				<div class="grid grid-rows-2">
					<div
						class="flex flex-col items-center justify-center gap-4 border-[3px] border-gray-400 font-mono text-6xl font-semibold"
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
								class="h-full text-center font-mono text-6xl hover:bg-red-100"
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
