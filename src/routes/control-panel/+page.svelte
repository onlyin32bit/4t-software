<script lang="ts">
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import {
		getCurrentTime,
		createLogMessage,
		download,
		dictionary,
		timerSettings,
		playSound,
		numberOfQues
	} from '$lib/utils';
	import { pb, user } from '$lib/pocketBase';
	import { onMount, onDestroy } from 'svelte';
	import { fly, fade } from 'svelte/transition';

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
	$: selected.numberOfQues = numberOfQues.get(selected.screen) ?? 0;
	$: current.numberOfQues = numberOfQues.get(current.screen) ?? 0;

	let selectedScore: number[] = [0, 0, 0, 0];

	let prevScreen: string;

	let time: number = 0;

	let menu = {
		setContestantName: false,
		settings: false
	};

	let setting: string;

	let selectionSlideList = ['start', 'rule', 'ques', 'end'];
	$: if (selected.screen === 'vcnv') {
		selectionSlideList = ['start', 'rule', 'main_vcnv', 'ques', 'end'];
	} else if (selected.screen === 'vd') {
		selectionSlideList = [
			'start',
			'rule',
			'main_vd',
			'ques_ts1',
			'ques_ts2',
			'ques_ts3',
			'ques_ts4',
			'end'
		];
	} else {
		selectionSlideList = ['start', 'rule', 'ques', 'end'];
	}

	let contestant_name: string[] = [];
	let contestant_class: string[] = [];
	let contestant_info = [
		{ name: '', class: '' },
		{ name: '', class: '' },
		{ name: '', class: '' },
		{ name: '', class: '' }
	];
	// あなたはゲイ
	let unsub: (() => void)[] = [];
	// chay khi component duoc load
	onMount(async () => {
		// fetch data
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

		// riel time database setup
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
	// chay khi component bi pha huy
	onDestroy(() => {
		// unsubscibe from riel time db
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	let selection: string;
	$: selection =
		dictionary.get(selected.screen) +
		(selected.screen === 'answers' || selected.screen === 'main' || selected.screen === 'scores'
			? ''
			: ' / ' + dictionary.get(selected.slide)) +
		(selected.screen === 'answers' || selected.screen === 'main' || selected.screen === 'scores'
			? ''
			: selected.slide == 'ques'
				? ' / Câu số ' + selected.question + '/' + selected.numberOfQues
				: '');

	async function startTimer() {
		time = (timerSettings.get(current.screen) ?? 0) * 1000;
		contestants.forEach(async (currentValue) => {
			await pb.collection('users').update(currentValue.id, { answer: null, time: -1 });
		});
		await pb.collection('display_status').update('4t-displaystate', {
			timer: 10
		});
		createLogMessage({
			from: 'system',
			type: 'TIMER',
			content: 'Bắt đầu đếm thời gian: ' + timerSettings.get(current.screen) + 's'
		});
		let ans: string = 'Câu trả lời của thí sinh: ';
		let countdown: any = setInterval(async () => {
			time -= 10;
			if (time <= 0) {
				clearInterval(countdown);
				countdown = null;

				contestants.forEach(async (currentValue) => {
					if (currentValue.time == -1) {
						await pb.collection('users').update(currentValue.id, { time: -2 });
					}
					ans += currentValue.name + ': ' + (currentValue.answer ?? 'Khong co') + '; ';
				});
				createLogMessage({
					from: 'system',
					type: 'TIMER',
					content: 'Đã hết thời gian'
				});
				await pb.collection('display_status').update('4t-displaystate', {
					timer: -1
				});
			}
		}, 10);
	}
	async function createMessage() {
		if (messageContent) {
			createLogMessage({
				from: $user?.name,
				type: 'MESSAGE',
				content: messageContent
			});
			messageContent = '';
		} else {
			alert('Hãy nhập nội dung tin nhắn');
		}
	}
	async function setScore() {
		if (JSON.stringify(selectedScore) !== JSON.stringify([0, 0, 0, 0])) {
			let message: string = '';
			contestants.forEach(async (currentValue, i) => {
				message +=
					currentValue.name +
					': ' +
					(currentValue.score + selectedScore[i]) +
					' (' +
					((selectedScore[i] >= 0 ? '+' : '') + selectedScore[i]) +
					'); ';
				await pb
					.collection('users')
					.update(currentValue.id, { score: currentValue.score + selectedScore[i] });
			});
			createLogMessage({
				from: 'system',
				type: 'SCORE',
				content: message
			});
			selectedScore = [0, 0, 0, 0];
		}
	}
	async function setContestantName() {
		let systemLog: string = 'Cập nhật thông tin thí sinh: ';
		for (let i = 0; i < 4; i++) {
			systemLog +=
				i + 1 + ': ' + contestant_name[i] + '-' + contestant_class[i] + (i === 3 ? '' : ' ; ');
			await pb.collection('users').update('4t-contestant-' + (i + 1), {
				name: contestant_name[i],
				class: contestant_class[i],
				answer: '',
				time: 0,
				score: 0,
				ring: false
			});
		}

		createLogMessage({
			from: 'system',
			type: 'DATABASE',
			content: systemLog + ' và đặt dữ liệu về ban đầu'
		});
		menu.setContestantName = false;
	}
	async function setScreen() {
		if (selected.screen !== current.screen) {
			await pb.collection('display_status').update('4t-displaystate', {
				screen: selected.screen,
				slide: selected.slide,
				ques: selected.question
			});
		}
	}
	async function setSlide() {
		if (selected.slide !== current.slide) {
			await pb.collection('display_status').update('4t-displaystate', {
				slide: selected.slide
			});
		}
	}
	async function setQuestion() {
		if (selected.question !== current.question) {
			await pb.collection('display_status').update('4t-displaystate', {
				ques: selected.question
			});
		}
	}
	async function setDisplayQuestion() {
		await pb.collection('display_status').update('4t-displaystate', {
			displayQuestion: true
		});
	}
	function saveLog() {
		let content = '#START LOG';
		logs.forEach((currentValue) => {
			content +=
				'\n' +
				currentValue.time +
				': <' +
				currentValue.from +
				'> [' +
				currentValue.type +
				']: ' +
				currentValue.content;
		});
		download(
			'4t_LOG_' + getCurrentTime().slice(0, 10).replaceAll('/', '-'),
			content + '\n' + '#END LOG'
		);
	}
	async function clearLog() {
		if (confirm('Confirm?')) {
			await pb.collection('log').update('4t-global-logs0', {
				logs: []
			});
		}
	}
</script>

<svelte:head>
	<title>Bảng điều khiển | BTC 4T</title>
</svelte:head>

<AuthCheck needBTC={true}>
	<section class="h-screen w-screen overflow-hidden">
		<div class="grid h-full grid-cols-2 grid-rows-[50px_1fr_1fr_50px] border-[3px] border-gray-400">
			<div class="flex items-center justify-between border-[3px] border-gray-400 p-2">
				<div class="flex items-center gap-4">
					<a href="/"><img src="/src/lib/image/4t-blue.png" alt="Logo 4T" class="h-[40px]" /></a>
					<h1 class="text-xl font-semibold">Control Panel - Thách Thức Trí Tuệ mùa 8</h1>
				</div>
				<div class="flex items-center gap-4">
					<button class="transition-colors hover:text-gray-500" on:click={clearLog}
						>CLEAR LOG</button
					>
					<button class="transition-colors hover:text-gray-500" on:click={saveLog}
						>SAVE CURRENT LOG</button
					>
				</div>
			</div>
			<div class="flex items-center justify-between border-[3px] border-gray-400 px-2">
				<h1>
					Current: {dictionary.get(current.screen)}
					{dictionary.get(current.slide)}
					{current.numberOfQues == -1 ? '' : current.question + '/' + current.numberOfQues}.
				</h1>
				<h1>Selected: {selection}</h1>
				<h1>Previous: {dictionary.get(prevScreen)}</h1>
			</div>
			<div class="row-span-2 flex flex-col border-[3px] border-gray-400">
				<div class="mt-1 flex h-full flex-col-reverse overflow-auto">
					<table class="table table-pin-rows table-sm mb-auto">
						<thead>
							<tr>
								<th class="w-48">Thời gian</th>
								<th class="w-20">Đến từ</th>
								<th class="w-20">Type</th>
								<th>Nội dung</th>
							</tr>
						</thead>
						<tbody>
							{#each logs as log}
								<tr
									class="last:bg-green-50 last:dark:bg-green-950 {log.from == 'system'
										? ' bg-red-50 dark:bg-red-950'
										: ''}"
									in:fly={{ y: 20 }}
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
			</div>
			<div class="grid grid-rows-[1fr_50px]">
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				{#if menu.settings}
					<div class="border-[3px] border-gray-400">
						<h1>HI</h1>
					</div>
				{:else if menu.setContestantName}
					<!-- <form
						class="flex flex-col gap-2 rounded-md bg-yellow-50 p-4 shadow-lg"
						on:submit|preventDefault={() => {
							if (confirm('Comfirm')) resetAllValue();
						}}
					> -->
					<table class="table table-zebra table-md w-full border-[3px] border-gray-400">
						<thead>
							<tr>
								<th>STT</th>
								<th>TÊN THÍ SINH</th>
								<th>LỚP</th>
							</tr>
						</thead>
						<tbody>
							{#each [0, 1, 2, 3] as i}
								<tr>
									<td>{i + 1}</td>
									<td>
										<input
											class="input input-bordered"
											placeholder="Nhập tên thí sinh"
											type="text"
											name="ts{i}"
											bind:value={contestant_name[i]}
										/>
									</td>
									<td>
										<input
											class="input input-bordered"
											placeholder="Nhập lớp"
											type="text"
											name="ts{i}"
											bind:value={contestant_class[i]}
										/>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
					<!-- <button class="btn btn-warning btn-sm" type="submit">SET</button> -->
					<!-- </form> -->
				{:else}
					<table
						class="table table-lg w-full min-w-[500px] rounded-none border-[3px] border-gray-400 outline-[3px] outline-blue-500 focus:outline"
						on:keydown={(e) => {
							console.log(e.key);
						}}
						tabindex="-1"
					>
						<thead>
							<tr>
								<!-- <th class="w-4">STT</th> -->
								<th class="w-32">TÊN THÍ SINH</th>
								<th class="w-48">CÂU TRẢ LỜI</th>
								<th class="w-16">THỜI GIAN</th>
								<th class="w-52">SỐ ĐIỂM</th>
							</tr>
						</thead>
						<tbody>
							{#each contestants as contestant, i (contestant.id)}
								<tr title="{contestant.name} {contestant.class} - {contestant.score}đ">
									<!-- <th>{i + 1}</th> -->
									<td class="font-semibold">{contestant.name}</td>
									<td>{contestant.answer}</td>
									<td class="font-mono"
										>{contestant.time === -2
											? 'ended'
											: contestant.time === -1
												? 'running'
												: contestant.time / 1000 + 's'}</td
									>
									<td>
										<div class="flex items-center justify-between font-mono text-[20px]">
											<button
												class="btn btn-secondary btn-sm"
												on:click={() => {
													selectedScore[i] -= 5;
												}}>-</button
											>
											<div class="flex items-baseline">
												<span>{contestant.score + (selectedScore[i] >= 0 ? '+' : '')}</span>
												<input
													class="ml-1 w-14 rounded-sm outline outline-2 outline-gray-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
													type="number"
													bind:value={selectedScore[i]}
												/>
											</div>
											<button
												class=" btn btn-secondary btn-sm"
												on:click={() => {
													selectedScore[i] += 10;
												}}>+</button
											>
										</div>
									</td>
								</tr>
								<div class="fixed top-0">{contestant}</div>
							{/each}
						</tbody>
					</table>
				{/if}
				<div class="grid grid-cols-[1fr_1fr_1fr]">
					<!-- <button
						class="border-[3px] border-gray-400 transition-colors hover:bg-gray-200"
						on:click={() => (menu.setContestantName = !menu.setContestantName)}
						>Set tên thí sinh</button
					> -->
					<select
						class="border-[3px] border-gray-400 bg-white transition-colors hover:bg-gray-200"
						bind:value={setting}
					>
						<option value="">Main</option>
						<option value="">Cai dat</option>
					</select>
					<button
						class="border-[3px]
						border-gray-400 transition-colors hover:bg-gray-200"
						on:click={setScore}
						>Set diem
					</button>
					<button
						class="border-[3px] border-gray-400 hover:bg-gray-200"
						on:click={() => {
							selectedScore = [0, 0, 0, 0];
						}}
						>Bỏ chọn điểm
					</button>
				</div>
			</div>
			<div class="border-[3px] border-gray-400">
				<!-- dieu khien man hinh -->
				<div role="tablist" class="tabs tabs-lifted tabs-sm rounded-lg bg-gray-100 xl:tabs-md">
					{#each ['main', 'answers', 'scores', 'kd', 'tt', 'vcnv', 'vd'] as item}
						<button
							class=" tab transition-colors duration-300 [--tab-bg:white]"
							class:tab-active={selected.screen === item}
							class:text-black={current.screen === item}
							class:text-gray-400={current.screen !== item}
							class:hover:text-gray-500={current.screen !== item}
							class:hover:bg-gray-50={selected.screen !== item}
							on:click={() => {
								if (item === current.screen) {
									selected.slide = current.slide;
									selected.question = current.question;
								} else if (['kd', 'tt', 'vcnv', 'vd'].includes(item) && prevScreen !== item) {
									selected.slide = 'start';
									selected.question = 1;
								}
								if (selected.screen === item) {
									prevScreen = current.screen;
									setScreen();
								}
								selected.screen = item;
							}}
						>
							{dictionary.get(item)}
						</button>
					{/each}
				</div>
				<div class="grid grid-cols-1 grid-rows-3 gap-4 p-4">
					<!-- {#if selected.screen !== current.screen}
						<button class="btn" on:click={changeScreen}>Switch To This Screen</button>
					{/if} -->
					<!-- chon slide -->
					{#if selected.screen === 'kd' || selected.screen === 'tt' || selected.screen === 'vcnv' || selected.screen === 'vd'}
						<div class="grid grid-cols-[50px_1fr_50px_1fr] gap-4 xl:grid-cols-[75px_1fr_75px_1fr]">
							<button
								class="btn"
								class:btn-disabled={selected.slide === 'start' ||
									selected.screen !== current.screen}
								on:click={() => {
									const prevIndex = selectionSlideList.indexOf(selected.slide) - 1;
									selected.slide = selectionSlideList[prevIndex];
									setSlide();
								}}>{'<'}</button
							>
							<select class="select select-bordered select-md" bind:value={selected.slide}>
								{#each selectionSlideList as value}
									<option {value}>{dictionary.get(value)}</option>
								{/each}
							</select>
							<button
								class="btn"
								class:btn-disabled={selected.slide === 'end' || selected.screen !== current.screen}
								on:click={() => {
									const nextIndex = selectionSlideList.indexOf(selected.slide) + 1;
									selected.slide = selectionSlideList[nextIndex];
									setSlide();
								}}>{'>'}</button
							>
							<button
								class="btn"
								class:btn-disabled={selected.screen !== current.screen ||
									selected.slide === current.slide}
								on:click={setSlide}>Change Slide</button
							>
						</div>
					{/if}
					{#if selected.slide == 'ques' && (selected.screen == 'kd' || selected.screen == 'tt')}
						<div class="grid grid-cols-[50px_1fr_50px_1fr] gap-4 xl:grid-cols-[75px_1fr_75px_1fr]">
							<button
								class="btn select-none"
								class:btn-disabled={selected.question <= 1 || selected.screen !== current.screen}
								on:click={() => {
									selected.question -= 1;
									setQuestion();
								}}>{'<'}</button
							>
							<div class="flex">
								<input
									class="input input-md input-bordered w-32 text-2xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
							</div>

							<button
								class="btn"
								class:btn-disabled={selected.question >= current.numberOfQues ||
									selected.screen !== current.screen}
								on:click={() => {
									selected.question += 1;
									setQuestion();
								}}>{'>'}</button
							>
							<button
								class="btn select-none"
								class:btn-disabled={selected.screen !== current.screen ||
									selected.question === current.question}
								on:click={setQuestion}>Change Question</button
							>
						</div>
						<div class="grid grid-cols-4 gap-4">
							<button class="btn" class:btn-disabled={selected.screen !== current.screen}
								>Play Animation</button
							>
							<button class="btn" on:click={setDisplayQuestion}>Display question </button>
							<button
								class="btn"
								class:btn-disabled={time > 0 || selected.screen !== current.screen}
								on:click={startTimer}>Start timer</button
							>
							<span class="font-mono text-xl font-semibold">{(time / 1000).toFixed(2)}s</span>
						</div>
					{:else if selected.slide == 'main_vcnv' && selected.screen == 'vcnv'}
						<div class="grid grid-cols-8">
							{#each [1, 2, 3, 4, 5, 6, 7, 8] as i}
								<div><button class="btn">{i}</button></div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
			<div class="col-span-2 flex items-center border-[3px] border-gray-400 pr-3">
				<form class="h-full w-full" on:submit|preventDefault={createMessage}>
					<input
						class="h-full w-full px-4 text-xl"
						type="text"
						placeholder="Nhập tin nhắn, nhấn Enter để gửi"
						bind:value={messageContent}
						class:input-error={!messageContent}
					/>
				</form>
				<button class="btn btn-circle btn-sm ml-auto" on:click|preventDefault={() => {}}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
						<path
							d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
						/>
					</svg>
				</button>
			</div>
		</div>
	</section>
</AuthCheck>
