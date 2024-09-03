<script lang="ts">
	import { getCurrentTime, createLogMessage, dict, timerSettings } from '$lib/utils';
	import { pb, user } from '$lib/pocketBase';
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';

	let contestants: any[] = [];
	let logs: any[] = [];
	let messageContent: string = '';

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

	let selected: DisplayObject = {
		screen: '',
		slide: '',
		question: -1,
		numberOfQues: -1
	};
	let selection: string;
	$: if (selected.screen === 'kd') {
		selected.numberOfQues = 12;
	} else if (selected.screen === 'tt' || current.screen === 'vd') {
		selected.numberOfQues = 4;
	} else if (selected.screen === 'vcnv') {
		selected.numberOfQues = 8;
	} else {
		selected.numberOfQues = -1;
	}

	$: if (current.screen === 'kd') {
		current.numberOfQues = 12;
	} else if (current.screen === 'tt' || current.screen === 'vd') {
		current.numberOfQues = 4;
	} else if (current.screen === 'vcnv') {
		current.numberOfQues = 8;
	} else {
		current.numberOfQues = -1;
	}

	let time: number = 0;

	let menu = {
		setContestantName: false,
		setScore: false
	};

	let selectionSlideList = ['start', 'rule', 'main_vcnv', 'ques', 'end'];

	let contestant_name: string[] = [];
	let contestant_class: string[] = [];

	let unsub: (() => void)[] = [];
	onMount(async () => {
		const userList = await pb.collection('users').getFullList();
		const logMessages = await pb.collection('log').getOne('4t-global-logs0');
		const displayStatus = await pb.collection('display_status').getOne('4t-displaystate');

		contestants = userList;
		logs = logMessages.logs;
		current = {
			screen: displayStatus.screen,
			slide: displayStatus.slide,
			question: displayStatus.ques,
			numberOfQues: -1
		};
		selected = { ...current };

		unsub[0] = await pb.collection('users').subscribe('*', ({ action, record }) => {
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
		unsub[1] = await pb.collection('log').subscribe('4t-global-logs0', ({ action, record }) => {
			// console.log(record);
			if (action === 'update') {
				logs = record.logs;
			}
		});
		unsub[2] = await pb
			.collection('display_status')
			.subscribe('4t-displaystate', ({ action, record }) => {
				if (action === 'update') {
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

	$: selection =
		dict.get(selected.screen) +
		(selected.screen === 'answers' || selected.screen === 'main' || selected.screen === 'scores'
			? ''
			: ' / ' + dict.get(selected.slide)) +
		(selected.screen === 'answers' || selected.screen === 'main' || selected.screen === 'scores'
			? ''
			: selected.slide == 'ques'
				? ' / Câu số ' + selected.question + '/' + selected.numberOfQues
				: '');

	async function startTimer() {
		contestants.forEach(async (currentValue) => {
			await pb.collection('users').update(currentValue.id, { answer: null, time: -1 });
		});
		createLogMessage({
			time: getCurrentTime(),
			from: 'system',
			type: 'TIMER',
			content: 'Bắt đầu đếm thời gian: ' + timerSettings.get(current.screen) + 's'
		});
		let countdown: number = setInterval(() => {
			time -= 10;
			if (time <= 0) {
				clearInterval(countdown);
				countdown = -1;
				contestants.forEach(async (currentValue) => {
					if (currentValue.time == -1) {
						await pb.collection('users').update(currentValue.id, { time: -2 });
					}
				});
				createLogMessage({
					time: getCurrentTime(),
					from: 'system',
					type: 'TIMER',
					content: 'Đã hết thời gian'
				});
			}
		}, 10);
	}

	async function createMessage() {
		if (messageContent) {
			createLogMessage({
				time: getCurrentTime(),
				from: $user?.name,
				type: 'MESSAGE',
				content: messageContent
			});
			messageContent = '';
		} else {
			alert('Hãy nhập nội dung tin nhắn');
		}
	}
	async function setScore() {}
	async function setRingSound() {}
	async function resetAllValue() {
		let systemLog: string = 'Đã cập nhật tên thí sinh: ';
		contestant_name.forEach(async (currentValue, i) => {
			const value = {
				name: currentValue,
				class: contestant_class[i],
				answer: '',
				time: 0,
				score: 0,
				ring: false
			};
			systemLog += i + 1 + ': ' + currentValue + '-' + contestant_class[i] + (i === 3 ? '' : ' | ');
			await pb.collection('users').update('4t-contestant-' + (i + 1), value);
		});

		createLogMessage({
			time: getCurrentTime(),
			from: 'system',
			type: 'UPDATE: DB',
			content: systemLog + ' và đặt dữ liệu về ban đầu'
		});
		menu.setContestantName = false;
	}

	async function changeScreen() {
		if (selected.screen !== current.screen) {
			await pb.collection('display_status').update('4t-displaystate', {
				screen: selected.screen,
				slide: selected.slide,
				ques: selected.question
			});
		}
	}

	async function changeSlides() {
		if (selected.slide !== current.slide) {
			await pb.collection('display_status').update('4t-displaystate', {
				slide: selected.slide
			});
		}
	}

	async function changeQuestion() {
		if (selected.question !== current.question) {
			await pb.collection('display_status').update('4t-displaystate', {
				ques: selected.question
			});
		}
	}
</script>

<svelte:head>
	<title>Bảng điều khiển | BTC 4T</title>
</svelte:head>

{#if $user && !$user.username.startsWith('ts')}
	<section class="relative h-screen p-4">
		<div class="flex flex-col">
			<h1 class="text-xl">Control Panel - Thách Thức Trí Tuệ mùa 8</h1>
			<div class="mt-1 flex h-96 flex-col-reverse overflow-auto rounded-md border-2">
				<table class="table table-pin-rows table-xs mb-auto">
					<thead>
						<tr>
							<th class="w-44">Thời gian</th>
							<th class="w-32">Đến từ</th>
							<th class="w-40">Type</th>
							<th>Nội dung</th>
						</tr>
					</thead>
					<tbody>
						{#each logs as log}
							<tr
								class="last:bg-green-50 last:dark:bg-green-950 {log.from == 'system'
									? ' bg-red-50 dark:bg-red-950'
									: ''}"
							>
								<th>{log.time}</th>
								<td class={log.from == 'system' ? 'font-medium text-red-700' : ''}
									>{log.from.toUpperCase()}</td
								>
								<td>{log.type}</td>
								<td>{log.content}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<form class="my-2 flex w-full gap-4" on:submit|preventDefault={createMessage}>
				<input
					class="input input-sm input-bordered w-full text-lg"
					type="text"
					placeholder="Nhập tin nhắn"
					bind:value={messageContent}
					class:input-error={!messageContent}
				/>
				<button class="btn btn-primary btn-sm">Gửi</button>
			</form>
		</div>
		<!-- status -->

		<div>
			<span class=""
				>Current: {dict.get(current.screen)}
				{dict.get(current.slide)}
				{current.numberOfQues == -1
					? 'no questions'
					: current.question + '/' + current.numberOfQues}.</span
			>
			<h1>Selected: {selection}</h1>
		</div>

		<div class="flex flex-wrap justify-between gap-8">
			<div class=" max-h-[240px] min-w-[800px] rounded-xl border">
				<!-- dieu khien man hinh -->
				<div role="tablist" class="tabs tabs-lifted">
					{#each ['main', 'answers', 'scores', 'kd', 'tt', 'vcnv', 'vd'] as item}
						<button
							class="tab text-gray-400"
							class:tab-active={selected.screen === item}
							class:text-black={current.screen === item}
							on:click={() => {
								selected.screen = item;
								if (current.slide === 'end') {
									selected.slide = 'start';
									selected.question = 1;
								}
							}}
							on:dblclick={changeScreen}>{dict.get(item)}</button
						>
					{/each}
				</div>
				<div class="space-y-2 p-4">
					<!-- {#if selected.screen !== current.screen}
						<button class="btn" on:click={changeScreen}>Switch To This Screen</button>
					{/if} -->
					<!-- chon slide -->
					{#if selected.screen === 'kd' || selected.screen === 'tt' || selected.screen === 'vcnv'}
						<div class="flex gap-2">
							<button
								class="btn"
								class:btn-disabled={selected.slide === 'start' ||
									selected.screen !== current.screen}
								on:click={() => {
									const prevIndex = selectionSlideList.indexOf(selected.slide) - 1;
									selected.slide =
										selectionSlideList[
											prevIndex -
												(selectionSlideList[prevIndex] === 'main_vcnv' && selected.screen !== 'vcnv'
													? 1
													: 0)
										];
									changeSlides();
								}}>{'<'}</button
							>
							<select class="select select-bordered select-md" bind:value={selected.slide}>
								{#each selectionSlideList as value}
									{#if value !== 'main_vcnv'}
										<option {value}>{dict.get(value)}</option>
									{:else if selected.screen === 'vcnv'}
										<option {value}>{dict.get(value)}</option>
									{/if}
								{/each}
							</select>
							<button
								class="btn"
								class:btn-disabled={selected.screen !== current.screen}
								on:click={changeSlides}>Change Slide</button
							>
							<button
								class="btn"
								class:btn-disabled={selected.slide === 'end' || selected.screen !== current.screen}
								on:click={() => {
									const nextIndex = selectionSlideList.indexOf(selected.slide) + 1;
									selected.slide =
										selectionSlideList[
											nextIndex +
												(selectionSlideList[nextIndex] === 'main_vcnv' && selected.screen !== 'vcnv'
													? 1
													: 0)
										];
									changeSlides();
								}}>{'>'}</button
							>
							<button class="btn" class:btn-disabled={selected.screen !== current.screen}
								>Play Animation</button
							>
						</div>
					{/if}
					{#if selected.slide == 'ques' && (selected.screen == 'kd' || selected.screen == 'tt')}
						<div class="flex gap-2">
							<button
								class="btn"
								class:btn-disabled={selected.question <= 1 || selected.screen !== current.screen}
								on:click={() => {
									selected.question -= 1;
									changeQuestion();
								}}>{'<'}</button
							>
							<input
								class="input input-md input-bordered w-16 text-2xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								type="number"
								min="1"
								max={current.numberOfQues}
								on:input={() => {}}
								bind:value={selected.question}
							/>
							<div class="flex w-8 flex-col">
								<button
									class="btn btn-xs select-none"
									class:btn-disabled={selected.question === selected.numberOfQues}
									on:click={() => (selected.question += 1)}
								>
									+
								</button>
								<button
									class="btn btn-xs select-none"
									class:btn-disabled={selected.question <= 1}
									on:click={() => (selected.question -= 1)}
								>
									-
								</button>
							</div>
							<button class="btn" class:btn-disabled={selected.screen !== current.screen}
								>Change Question</button
							>
							<button
								class="btn"
								class:btn-disabled={selected.question >= current.numberOfQues ||
									selected.screen !== current.screen}
								on:click={() => {
									selected.question += 1;
									changeQuestion();
								}}>{'>'}</button
							>
						</div>
						<div class="flex items-center gap-4">
							<button
								class="btn"
								on:dblclick={() => {
									console.log('clicked');
								}}
								>display question
							</button>
							<button
								class="btn"
								class:btn-disabled={time > 0}
								on:click={() => {
									time = (timerSettings.get(current.screen) ?? 0) * 1000;
									startTimer();
								}}>start timer</button
							>
							<span class="font-mono text-xl font-semibold">{(time / 1000).toFixed(2)}s</span>
						</div>
					{/if}
				</div>
			</div>
			<div class="">
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<table
					class="table table-zebra table-sm mb-4 box-border min-w-[500px] max-w-[800px] rounded-none border outline-[3px] outline-blue-500 focus:outline"
					on:keydown={(e) => {
						console.log(e.key);
					}}
					tabindex="-1"
				>
					<thead>
						<tr>
							<th class="w-4">STT</th>
							<th class="w-32">Tên thí sinh</th>
							<th class="w-52">Câu trả lời</th>
							<th>Thời gian </th>
							<th class="w-16">Số điểm</th>
						</tr>
					</thead>
					<tbody>
						{#each contestants as contestant, i (contestant.id)}
							<tr>
								<th>{i + 1}</th>
								<td class="font-semibold">{contestant.name}</td>
								<td>{contestant.answer}</td>
								<td class="font-mono"
									>{contestant.time === -2
										? 'ended'
										: contestant.time === -1
											? 'running'
											: contestant.time / 1000 + 's'}</td
								>
								<td class="font-mono">{contestant.score}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<button
					class="btn btn-warning btn-sm"
					on:click={() => (menu.setContestantName = !menu.setContestantName)}
					>Set tên thí sinh</button
				>
				<button class="btn btn-sm" on:click={() => (menu.setScore = !menu.setScore)}
					>Set điểm
				</button>
			</div>
		</div>

		{#if menu.setContestantName}
			<form
				class="w fixed bottom-4 right-4 flex flex-col gap-2 rounded-md bg-yellow-50 p-4 shadow-lg"
				on:submit|preventDefault={() => {
					if (confirm('Comfirm')) resetAllValue();
				}}
				transition:fly={{ x: 300 }}
			>
				<h1 class="font-semibold">SET TÊN THÍ SINH VÀ RESET</h1>
				{#each [1, 2, 3, 4] as i}
					<div class="flex gap-2">
						<label>
							<div class="label">
								<span class="label-text">Thí sinh {i}</span>
							</div>
							<input
								class="input input-bordered"
								placeholder="Nhập tên thí sinh"
								type="text"
								name="ts{i}"
								bind:value={contestant_name[i - 1]}
							/>
						</label>
						<label>
							<div class="label">
								<span class="label-text">Lớp</span>
							</div>
							<input
								class="input input-bordered w-32"
								placeholder="Nhập lớp"
								type="text"
								name="ts{i}"
								bind:value={contestant_class[i - 1]}
							/>
						</label>
					</div>
				{/each}
				<div class="mt-2 flex w-full gap-4">
					<button
						class="btn btn-circle btn-error btn-sm text-white"
						on:click|preventDefault={() => (menu.setContestantName = false)}>×</button
					>
					<button class="btn btn-warning btn-sm grow" type="submit">SET</button>
				</div>
			</form>
		{/if}
	</section>
{:else}
	<h1>Đăng nhập hoặc sử dụng tài khoản BTC để tiếp tục</h1>
	<a href="/">Quay về</a>
{/if}
