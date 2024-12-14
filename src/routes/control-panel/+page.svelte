<script lang="ts">
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import {
		getCurrentTime,
		getScreenStats,
		createLogMessage,
		download,
		dictionary,
		timerSettings,
		playSound,
		formatTime2,
		numberOfQues,
		sendSoundRequest
	} from '$lib/utils';
	import { pb, user } from '$lib/pocketBase';
	import { onMount, onDestroy, tick } from 'svelte';
	import { fly, fade, scale, slide } from 'svelte/transition';
	import { Toaster, toast } from 'svelte-sonner';
	import type { RecordModel } from 'pocketbase';
	import type { DisplayObject } from '$lib/types';

	let contestants: RecordModel[] = [];
	let logs: RecordModel[] = [];
	let messageContent: string = '';

	let current: DisplayObject = {
		screen: '',
		slide: '',
		question: -1,
		numberOfQues: -1
	};

	let selected: DisplayObject = { ...current };
	$: selected.numberOfQues =
		numberOfQues.get(
			selected.screen +
				(selected.screen === 'kd'
					? selected.slide === 'ques_chung'
						? '_chung'
						: selected.slide.startsWith('ques_ts')
							? '_rieng'
							: ''
					: '')
		) ?? 0;
	$: current.numberOfQues =
		numberOfQues.get(
			current.screen +
				(current.screen === 'kd'
					? current.slide === 'ques_chung'
						? '_chung'
						: current.slide.startsWith('ques_ts')
							? '_rieng'
							: ''
					: '')
		) ?? 0;

	let selectedScore: number[] = [0, 0, 0, 0];

	let prevScreen: string;

	let displayQuestionStatus: boolean;

	let playMediaSource: string;

	let elapsed: number = 0;

	let menu: string = 'main';

	let settings: { season: number; game: string; game_number: number } = {
		season: 8,
		game: 'tk',
		game_number: 1
	};

	let selectionSlideList = ['start', 'rule', 'ques', 'end'];
	$: if (selected.screen === 'kd') {
		selectionSlideList = [
			'start',
			'rule',
			'intro',
			'main_kd',
			'ques_chung',
			'ques_ts1',
			'ques_ts2',
			'ques_ts3',
			'ques_ts4',
			'end_ts',
			'end'
		];
	} else if (selected.screen === 'tt') {
		selectionSlideList = ['start', 'rule', 'intro', 'ques', 'end'];
	} else if (selected.screen === 'vcnv') {
		selectionSlideList = ['start', 'rule', 'intro', 'main_vcnv', 'image_vcnv', 'ques', 'end'];
	} else if (selected.screen === 'vd') {
		selectionSlideList = [
			'start',
			'rule',
			'intro',
			'main_vd',
			'pre_ques_ts1',
			'ques_ts1',
			'pre_ques_ts2',
			'ques_ts2',
			'pre_ques_ts3',
			'ques_ts3',
			'pre_ques_ts4',
			'ques_ts4',
			'end_ts',
			'end'
		];
	} else {
		selectionSlideList = ['start', 'rule', 'ques', 'end'];
	}

	let contestant_info = [
		{ name: undefined, class: undefined },
		{ name: undefined, class: undefined },
		{ name: undefined, class: undefined },
		{ name: undefined, class: undefined }
	];
	let resetContestantsParams: boolean = false;

	let stopTimer: boolean = false;

	let unsub: (() => void)[] = [];
	// chay khi component duoc load
	onMount(async () => {
		// fetch data
		const userListRecord = await pb.collection('users').getFullList();
		const logsRecord = await pb.collection('logs').getFullList();
		const displayStatusRecord = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		// const settingsRecord = await pb.collection('settings').getOne('GLOBAL-SETTINGS');

		contestants = userListRecord;
		logs = logsRecord;
		current = {
			screen: displayStatusRecord.screen,
			slide: displayStatusRecord.slide,
			question: displayStatusRecord.ques,
			numberOfQues: -1
		};
		selected = { ...current };
		displayQuestionStatus = displayStatusRecord.displayQuestion;
		// settings = {
		// 	season: settingsRecord.field.season,
		// 	game: settingsRecord.field.game,
		// 	game_number: settingsRecord.field.game_number
		// };

		console.log(settings.season);

		// riel time database setup
		unsub = [
			await pb.collection('users').subscribe('*', ({ action, record }) => {
				if (action === 'update') {
					contestants = contestants.map((currentValue) =>
						currentValue.id === record.id ? record : currentValue
					);
				}
			}),
			await pb.collection('logs').subscribe('*', ({ action, record }) => {
				if (action === 'create') {
					logs = [...logs, record];
					scrollLogToBottom();
				} else if (action === 'delete')
					logs = logs.filter((currentValue) => currentValue.id !== record.id);
			}),
			await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
				if (action === 'update') {
					if (current.screen !== record.screen) current.screen = record.screen;
					if (current.slide !== record.slide) current.slide = record.slide;
					if (current.question !== record.ques) current.question = record.ques;
					if (displayQuestionStatus !== record.displayQuestion)
						displayQuestionStatus = record.displayQuestion;
					if (playMediaSource !== record.mediaToPlay) playMediaSource = record.mediaToPlay;
				}
			})
		];
	});
	// chay khi component bi pha huy
	onDestroy(() => unsub.forEach((currentValue) => currentValue?.()));

	const timePreset: { [key: string]: number } = {
		20: 15,
		30: 20
	};

	let logsElement: HTMLElement;
	async function scrollLogToBottom() {
		await tick();
		logsElement.scrollTop = logsElement.scrollHeight;
	}
	async function startTimer(duration: number) {
		if (elapsed > 0) {
			stopTimer = true;
			return;
		}
		await pb.collection('display_status').update('4T-DISPLAYSTATE', {
			timer: duration
		});
		stopTimer = false;
		let last_time = window.performance.now();
		let frame;
		createLogMessage('system', 'TIMER', 'Bắt đầu đếm thời gian: ' + duration + 'ms');
		(async function update() {
			frame = requestAnimationFrame(update);

			const time = window.performance.now();
			elapsed += Math.min(time - last_time, duration - elapsed);
			last_time = time;
			if (elapsed >= duration || stopTimer) {
				cancelAnimationFrame(frame);
				createLogMessage('system', 'TIMER', `Đã ${stopTimer ? 'ngưng' : 'hết'} thời gian`);
				await pb.collection('display_status').update('4T-DISPLAYSTATE', {
					timer: -1
				});
				if (stopTimer) sendSoundRequest('stop_timer');
				// contestants.forEach(async (currentValue) => {
				// 	if (currentValue.time == -1) {
				// 		await pb.collection('users').update(currentValue.id, { time: -2 });
				// 	}
				// });
				stopTimer = false;
				elapsed = 0;
			}
		})();
		elapsed = 0;
	}
	async function createMessage() {
		if (/\w/.test(messageContent)) {
			if ($user) createLogMessage($user.name, 'MESSAGE', messageContent);
			toast.success('Đã gửi tin nhắn');
			messageContent = '';
		} else {
			toast.warning('Hãy nhập nội dung tin nhắn');
		}
	}
	async function setScore() {
		if (JSON.stringify(selectedScore) === '[0,0,0,0]') {
			toast.warning('Chưa nhập điểm thí sinh');
		} else {
			let message: string = '';
			contestants.forEach(async (currentValue, i) => {
				message +=
					currentValue.name +
					': ' +
					(currentValue.score + selectedScore[i]) +
					' (' +
					((selectedScore[i] >= 0 ? '+' : '') + selectedScore[i]) +
					'); ';
				if (selectedScore[i] !== 0)
					await pb
						.collection('users')
						.update(currentValue.id, { score: currentValue.score + selectedScore[i] });
			});

			createLogMessage('system', 'SCORE', message);
			selectedScore = [0, 0, 0, 0];
		}
	}
	async function setContestantInfo() {
		contestant_info.forEach(async (currentValue, i) => {
			// systemLog += i + 1 + ': ' + currentValue.name + '-' + currentValue.name + ';';
			const currentContestant = '4t-contestant-' + (i + 1);
			await pb.collection('users').update(currentContestant, {
				name: currentValue.name,
				class: currentValue.class
			});
			if (resetContestantsParams) {
				await pb.collection('users').update(currentContestant, {
					answer: null,
					time: 0,
					score: 0,
					ring: 0
				});
			}
		});

		createLogMessage('system', 'INFO', 'Đã cập nhật thông tin thí sinh');
		menu = 'main';
	}
	async function setScreen() {
		if (selected.screen !== current.screen) {
			await pb.collection('display_status').update('4T-DISPLAYSTATE', {
				screen: selected.screen,
				slide: selected.slide,
				ques: selected.question,
				timer: -1
			});
			if (elapsed > 0) sendSoundRequest('stop_timer');
			if (displayQuestionStatus) setDisplayQuestionStatus(false);
			stopTimer = true;
		}
	}
	async function setSlide() {
		if (selected.slide !== current.slide) {
			// selected.question = 1;
			await pb.collection('display_status').update('4T-DISPLAYSTATE', {
				slide: selected.slide,
				ques: selected.question,
				timer: -1
			});
			if (elapsed > 0) sendSoundRequest('stop_timer');
			if (selected.screen === 'vcnv' && selected.slide === 'intro') resetAllStateVCNV();
			if (displayQuestionStatus) setDisplayQuestionStatus(false);
			stopTimer = true;
		}
	}
	async function setQuestion() {
		if (selected.question !== current.question) {
			await pb.collection('display_status').update('4T-DISPLAYSTATE', {
				ques: selected.question,
				timer: -1
			});
			clearContestantAnswer();
			if (elapsed > 0) sendSoundRequest('stop_timer');
			if (selected.question > current.numberOfQues) sendSoundRequest('stop_bg_music');
			if (selected.screen === 'vd') {
				setDisplayQuestionStatus(false);
				changeStarState(false);
			}
			stopTimer = true;
		}
	}

	async function setDisplayQuestionStatus(value: boolean) {
		await pb.collection('display_status').update('4T-DISPLAYSTATE', {
			displayQuestion: value
		});
	}

	async function clearContestantAnswer(log: boolean = false) {
		contestants.forEach(async (currentValue) => {
			await pb.collection('users').update(currentValue.id, { answer: null, time: 0 });
		});
		if (log) createLogMessage('system', 'INFO', 'Đã xóa đáp án thí sinh');
	}

	async function clearContestantBell() {
		contestants.forEach(async (currentValue) => {
			await pb.collection('users').update(currentValue.id, { ring: 0 });
		});
	}

	async function resetAllStateVCNV() {
		await pb.collection('display_status_vcnv').update('4T-DISPLAYSTATE', {
			obstacle: false,
			start: false,
			1: '',
			2: '',
			3: '',
			4: '',
			h1: false,
			h2: false,
			h3: false,
			h4: false,
			hcenter: false
		});
	}

	async function changeRowState(row: number, state: string) {
		await pb.collection('display_status_vcnv').update('4T-DISPLAYSTATE', {
			[row]: state
		});
	}

	async function changeImageState(image: number | 'center', state: boolean) {
		await pb.collection('display_status_vcnv').update('4T-DISPLAYSTATE', {
			[`h${image}`]: state
		});
	}

	async function changeObstacleState(state: boolean) {
		await pb.collection('display_status_vcnv').update('4T-DISPLAYSTATE', {
			obstacle: state
		});
	}

	async function changeObstacleStartState(state: boolean) {
		await pb.collection('display_status_vcnv').update('4T-DISPLAYSTATE', {
			start: state
		});
	}

	async function setQuestionSet(contestant: string) {
		const question_set = selectedContestantQuestionSet;
		const offset = selectedContestantQuestionSetOffset.map(
			(currentValue, i) => currentValue - i - 1
		);
		await pb.collection('display_status_vd').update('4T-DISPLAYSTATE', {
			[contestant]: { question_set, offset }
		});
	}

	async function changeStarState(state: boolean) {
		await pb.collection('display_status_vd').update('4T-DISPLAYSTATE', {
			star: state
		});
	}

	function saveLog() {
		let logContent = '#START LOG';
		logs.forEach(
			(currentValue) =>
				(logContent += `\n${currentValue.time}: <${currentValue.from}> [${currentValue.type}]: ${currentValue.content}`)
		);
		download(
			`4TMua${settings.season}-LOG-${settings.game.toUpperCase()}${settings.game === 'ck' ? '' : '-' + settings.game_number}`,
			logContent + '\n#END LOG'
		);
	}
	function clearLog() {
		if (confirm('Confirm?')) {
			logs.forEach(async (currentValue) => {
				await pb.collection('logs').delete(currentValue.id);
			});
			logs = [];
			toast.success('Đã xóa Log');
		}
	}
	let selectedObstacleRow: number = 1;
	let selectedObstacleImage: number | 'center' = 1;
	let selectedContestantQuestionSet: string[] = [];
	let selectedContestantQuestionSetOffset: number[] = [1, 2, 3];
</script>

<svelte:head>
	<title>Bảng điều khiển | BTC 4T</title>
</svelte:head>

<Toaster closeButton richColors position="top-right" />

<AuthCheck requiredBTC={true}>
	<section class="h-screen w-screen overflow-hidden">
		<div
			class="grid h-full grid-cols-[1fr_1.3fr] grid-rows-[50px_1fr_1fr_50px] border-[3px] border-gray-400"
		>
			<!-- header -->
			<div class="flex items-center justify-between border-[3px] border-gray-400 p-2">
				<div class="flex items-center gap-4 text-xl font-semibold">
					<a href="/"><img src="/src/lib/image/4t-blue.png" alt="Logo 4T" class="h-10" /></a>
					<h1>CONTROL PANEL - THÁCH THỨC TRÍ TUỆ MÙA 8</h1>
				</div>
				<div class="flex items-center gap-4">
					<button class="transition-colors hover:text-gray-500" on:click={clearLog}
						>CLEAR LOG</button
					>
					<button class="transition-colors hover:text-gray-500" on:click={saveLog}>SAVE LOG</button>
				</div>
			</div>
			<!-- status display -->
			<div class="flex items-center justify-between border-[3px] border-gray-400 px-2">
				<h1>
					Current: {getScreenStats(current)}
				</h1>
				<h1>Selected: {getScreenStats(selected)}</h1>
				<h1>Previous: {dictionary.get(prevScreen)}</h1>
			</div>
			<!-- logs -->
			<div class="row-span-2 flex flex-col border-[3px] border-gray-400">
				<div class="mt-1 flex h-full flex-col-reverse overflow-auto" bind:this={logsElement}>
					<table class="table table-pin-rows table-sm mb-auto">
						<thead class="border-b-2">
							<tr>
								<th class="w-44">Thời gian</th>
								<th class="w-28">Đến từ</th>
								<th class="w-20">Type</th>
								<th>Nội dung</th>
								<th class="w-2"></th>
							</tr>
						</thead>
						<tbody>
							{#each logs as log}
								<tr
									class={'bg-opacity-50 last:bg-green-50 last:dark:bg-green-950' +
										(log.from == 'system' ? ' bg-red-50 dark:bg-red-950' : '')}
									in:fly={{ y: 20 }}
								>
									<th class="font-mono">{log.time}</th>
									<td class={'font-medium ' + (log.from == 'system' ? 'text-red-700' : '')}
										>{log.from.toUpperCase()}</td
									>
									<td>{log.type}</td>
									<td>{log.content}</td>
									<td>
										<button
											class="hover:text-red-500"
											on:click={async () => {
												if (confirm('Xoa tin nhan nay?')) {
													await pb.collection('logs').delete(log.id);
													toast.success('Đã xóa tin nhắn: "' + log.content + '"');
												}
											}}>×</button
										>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
			<div class="grid grid-rows-[1fr_50px]">
				<div class="h-full border-[3px] border-gray-400">
					{#if menu === 'info'}
						<table class="table table-zebra table-md w-full">
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
												bind:value={contestant_info[i].name}
											/>
										</td>
										<td>
											<input
												class="input input-bordered"
												placeholder="Nhập lớp"
												type="text"
												name="ts{i}"
												bind:value={contestant_info[i].class}
											/>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else if menu === 'settings'}
						<div>hi</div>
					{:else}
						<div
							class="grid h-full grid-cols-[12rem_1fr_7rem_3rem_1fr_3rem] grid-rows-[30px_1fr_1fr_1fr_1fr]"
						>
							<div class="flex items-center border-b-2 px-3 py-1 text-xs font-bold text-gray-400">
								TÊN THÍ SINH
							</div>
							<div class="flex items-center border-b-2 px-3 py-1 text-xs font-bold text-gray-400">
								CÂU TRẢ LỜI
							</div>
							<div
								class="flex items-center justify-center border-b-2 px-3 py-1 text-xs font-bold text-gray-400"
							>
								THỜI GIAN
							</div>
							<div
								class="col-span-3 flex items-center justify-center border-b-2 px-3 py-1 text-xs font-bold text-gray-400"
							>
								ĐIỂM
							</div>
							{#each contestants as contestant, i (contestant.id)}
								<div
									class="flex items-center gap-2 border-b-2 px-3 text-xl font-semibold"
									title={`${contestant.name} - Lớp ${contestant.class} [Status: ${contestant.online ? 'ONLINE' : 'OFFLINE'}]`}
								>
									<svg viewBox="0 0 500 500" width="12px" height="12px"
										><ellipse
											style={`fill: #${contestant.online ? '00ff00' : 'aaaaaa'};`}
											cx="250"
											cy="250"
											rx="250"
											ry="250"
										></ellipse></svg
									>
									{contestant.name}
									{#if contestant.ring > 0}
										<svg
											class="h-5 animate-wiggle"
											fill="#000"
											viewBox="0 0 448 512"
											transition:scale
										>
											<path
												d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
											/>
										</svg>
									{/if}
								</div>
								<div class="flex items-center border-b-2 px-3 text-lg">
									{contestant.answer === '' ? 'Chưa có câu trả lời' : contestant.answer}
								</div>
								<div class="flex items-center justify-center border-b-2 font-mono text-xl">
									{contestant.time === -2
										? 'ended'
										: contestant.time === -1
											? 'running'
											: formatTime2(contestant.time)}
								</div>
								<button
									class="h-full w-full bg-slate-100 text-3xl font-light text-gray-400 transition-colors hover:bg-blue-100"
									on:click={() => {
										selectedScore[i] -= 5;
									}}>-</button
								>
								<div class="flex items-center justify-center border-b-2">
									<div class="flex translate-x-6 font-mono text-3xl">
										{#key contestant.score}
											<div class="relative">
												<span
													class="absolute right-0 font-bold"
													in:fly={{ y: 20 }}
													out:fly={{ y: -20 }}>{contestant.score}</span
												>
											</div>
										{/key}
										<div class="ml-3 flex items-baseline">
											<span class="font-thin text-gray-400">
												{selectedScore[i] >= 0 ? '+' : ''}
											</span>
											<input
												class="rounded-sm text-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
												style={`width: ${String(selectedScore[i]).length}ch`}
												type="number"
												bind:value={selectedScore[i]}
											/>
										</div>
									</div>
								</div>
								<button
									class="h-full w-full bg-slate-100 text-3xl font-light text-gray-400 transition-colors hover:bg-blue-100"
									on:click={() => {
										selectedScore[i] += 10;
									}}>+</button
								>
							{/each}
						</div>
					{/if}
				</div>
				<div class="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
					<select
						class="border-[3px] border-gray-400 bg-white px-4 transition-colors hover:bg-gray-200"
						bind:value={menu}
					>
						<option value="main">Main</option>
						<option value="other-accounts">Tài khoản khác</option>
						<option value="info">Set thong tin thi sinh</option>
						<option value="settings">Cai dat</option>
					</select>
					<button
						class="border-[3px]
						border-gray-400 transition-colors hover:bg-gray-200"
						on:click={() => {
							menu === 'info' ? setContestantInfo() : setScore();
						}}
					>
						Set {menu === 'info' ? 'thông tin' : 'điểm'}
					</button>
					{#if menu === 'main'}
						<button
							class="border-[3px] border-gray-400 hover:bg-gray-200"
							on:click={() => {
								selectedScore = [0, 0, 0, 0];
							}}
						>
							Bỏ chọn điểm
						</button>
					{:else if menu === 'info'}
						<div class="flex items-center justify-center gap-2 border-[3px] border-gray-400">
							<input type="checkbox" class="checkbox" bind:checked={resetContestantsParams} />
							<span>Đặt lại các tham số</span>
						</div>
					{/if}
					<button
						class="btn"
						on:click={() => {
							clearContestantBell();
						}}>CLEAR BELL</button
					>
					<button
						class="btn"
						on:click={() => {
							if (confirm('Xoa dap an thi sinh?')) clearContestantAnswer(true);
						}}>CLEAR ANSWER</button
					>
				</div>
			</div>

			<!-- dieu khien man hinh -->
			<div class="select-none border-[3px] border-gray-400">
				<div class="grid h-16 grid-flow-col border-b-2 text-xl">
					{#each ['', 'main', 'answers_tt', 'answers_vcnv', 'scores', 'kd', 'vcnv', 'tt', 'vd', 'extra'] as screen}
						<button
							class={`transition-colors duration-300 ${current.screen === screen ? 'text-black' : 'text-gray-400 hover:text-gray-500'} ${selected.screen === screen ? 'bg-red-100' : 'hover:bg-gray-50'}`}
							on:click={() => {
								if (screen === current.screen) {
									selected.slide = current.slide;
									selected.question = current.question;
								} else if (['kd', 'tt', 'vcnv', 'vd'].includes(screen) && current.slide === 'end') {
									selected.slide = 'start';
									selected.question = 1;
								}
								if (selected.screen === screen) {
									prevScreen = current.screen;
									setScreen();
								}
								selected.screen = screen;
							}}
						>
							{dictionary.get(screen)}
						</button>
					{/each}
				</div>
				<div class="grid grid-cols-1 grid-rows-4 gap-4 p-4">
					{#if ['kd', 'tt', 'vcnv', 'vd'].includes(selected.screen)}
						<div class="grid grid-cols-[50px_1fr_50px_1fr] gap-4 xl:grid-cols-[75px_1fr_75px_1fr]">
							<button
								class="btn"
								class:btn-disabled={selected.slide === 'start' ||
									selected.screen !== current.screen}
								on:click={() => {
									const prevIndex = selectionSlideList.indexOf(selected.slide) - 1;
									selected.slide = selectionSlideList[prevIndex];
									setSlide();
								}}
								>{'<'}
							</button>
							<select class="select select-bordered select-md text-xl" bind:value={selected.slide}>
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
								}}
								>{'>'}
							</button>
							<button
								class="btn"
								class:btn-disabled={selected.screen !== current.screen ||
									selected.slide === current.slide}
								on:click={setSlide}
								>Jump To Slide
							</button>
						</div>

						{#if selected.slide.startsWith('ques')}
							<div
								class="grid grid-cols-[50px_1fr_50px_1fr] gap-4 xl:grid-cols-[75px_1fr_75px_1fr]"
							>
								<button
									class="btn"
									class:btn-disabled={selected.question <= 1 || selected.screen !== current.screen}
									on:click={() => {
										selected.question -= 1;
										setQuestion();
									}}>{'<'}</button
								>
								{#if selected.question > selected.numberOfQues}
									<div class="text-center text-4xl font-bold">ENDED</div>
								{:else}
									<div class="flex justify-center">
										<input
											class="input input-md input-bordered w-32 text-2xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
											type="number"
											min="1"
											max={current.numberOfQues}
											bind:value={selected.question}
										/>
										<div class="flex w-8 flex-col">
											<button
												class="btn btn-xs"
												class:btn-disabled={selected.question >= selected.numberOfQues}
												on:click={() => (selected.question += 1)}
											>
												+
											</button>
											<button
												class="btn btn-xs"
												class:btn-disabled={selected.question <= 1}
												on:click={() => (selected.question -= 1)}
											>
												-
											</button>
										</div>
									</div>
								{/if}

								<button
									class="btn"
									class:btn-disabled={selected.question > current.numberOfQues ||
										(selected.screen !== 'kd' && selected.question >= current.numberOfQues) ||
										selected.screen !== current.screen}
									on:click={() => {
										selected.question += 1;
										setQuestion();
									}}>{selected.question >= selected.numberOfQues ? 'END' : '>'}</button
								>
								<button
									class="btn"
									class:btn-disabled={selected.screen !== current.screen ||
										selected.question === current.question}
									on:click={setQuestion}>Jump To Question</button
								>
							</div>
							<div class="grid grid-cols-6 gap-4">
								<button
									class="btn"
									class:btn-disabled={selected.screen !== 'vd'}
									on:click={() => {
										if (confirm('Dat ngoi sao hi vong?')) {
											changeStarState(true);
											sendSoundRequest('vd_choose_star');
										}
									}}>NSHV</button
								>
								<button
									class="btn"
									on:click={() => {
										if (current.screen === 'kd') sendSoundRequest('kd_bg_music');
										setDisplayQuestionStatus(true);
									}}
									>Display question
								</button>
								<button
									class="btn"
									on:click={() => {
										sendSoundRequest(`media:${playMediaSource}`);
									}}
									>Play media
								</button>
								<button
									class="btn"
									class:btn-disabled={selected.screen === 'tt'}
									on:click={() => {
										selected.slide = `main_${selected.screen}`;
										setSlide();
									}}
									>Back to main
								</button>
								<button
									class="btn"
									class:btn-disabled={['vcnv', 'tt'].includes(selected.screen) ||
										selected.question < selected.numberOfQues}
									on:click={() => {
										selected.slide = 'end_ts';
										setSlide();
									}}
									>END SLIDE
								</button>

								<span class="flex items-center justify-center font-mono text-2xl font-semibold"
									>{formatTime2(elapsed)}s</span
								>
							</div>
							<div class="grid grid-cols-6 gap-4">
								<button
									class="btn"
									class:btn-disabled={false}
									on:click={() => {
										if (current.screen === 'kd') {
											clearContestantBell();
											if (selected.question < current.numberOfQues) {
												selected.question += 1;
												setQuestion();
											}
										}
										sendSoundRequest(selected.screen + '_correct');
									}}>Đúng</button
								>
								<button
									class="btn"
									class:btn-disabled={selected.screen !== current.screen}
									on:click={() => {
										if (current.screen === 'kd') sendSoundRequest('kd_time_3');
										else
											sendSoundRequest(
												`${current.screen}_time${
													selected.screen === 'vd'
														? `_${timePreset[selectedContestantQuestionSet[selected.question - 1]]}`
														: ''
												}`
											);

										startTimer(
											timerSettings.get(
												current.screen +
													(selected.screen === 'vd'
														? `_${timePreset[selectedContestantQuestionSet[selected.question - 1]]}`
														: '')
											) ?? 0
										);
									}}>{elapsed > 0 ? 'Stop' : 'Start'} timer</button
								>
								<button
									class="btn"
									on:click={() => {
										if (current.screen === 'kd') {
											clearContestantBell();
											if (selected.question < current.numberOfQues) {
												selected.question += 1;
												setQuestion();
											}
										}
										sendSoundRequest(current.screen + '_wrong');
									}}>Sai</button
								>
								<button
									class="btn"
									on:click={() => {
										sendSoundRequest('space');
									}}>Dấu ...</button
								>
								<button
									class="btn"
									class:btn-disabled={!['vcnv', 'tt'].includes(selected.screen) ||
										selected.screen !== current.screen}
									on:click={() => {
										selected.screen = `answers_` + selected.screen;
										setScreen();
									}}
									>Go to answer
								</button>
								<button
									class="btn"
									class:btn-disabled={selected.screen !== 'vd'}
									on:click={() => {
										startTimer(5000);
										sendSoundRequest('vd_time_5');
									}}>5s Thi sinh con lai</button
								>
							</div>
						{/if}

						{#if selected.slide === 'main_kd' || selected.slide === 'main_vd'}
							<div class="grid grid-cols-2 gap-x-4">
								<button
									class="btn"
									on:click={() => {
										if (selected.screen === 'vd') selected.slide = 'pre_ques_ts1';
										else selected.slide = 'ques_ts1';
										selected.question = 1;
										setSlide();
									}}>Thi sinh 1</button
								>
								<button
									class="btn"
									on:click={() => {
										if (selected.screen === 'vd') selected.slide = 'pre_ques_ts2';
										else selected.slide = 'ques_ts2';
										selected.question = 1;
										setSlide();
									}}>Thi sinh 2</button
								>
							</div>
							<div class="grid grid-cols-2 gap-x-4">
								<button
									class="btn"
									on:click={() => {
										if (selected.screen === 'vd') selected.slide = 'pre_ques_ts3';
										else selected.slide = 'ques_ts3';
										selected.question = 1;
										setSlide();
									}}>Thi sinh 3</button
								>
								<button
									class="btn"
									on:click={() => {
										if (selected.screen === 'vd') selected.slide = 'pre_ques_ts4';
										else selected.slide = 'ques_ts4';
										selected.question = 1;
										setSlide();
									}}>Thi sinh 4</button
								>
							</div>
							{#if selected.screen === 'kd'}
								<button
									class="btn"
									on:click={() => {
										selected.slide = 'test_bell';
										setSlide();
									}}
									>Ques chung (Test chuong truoc)
								</button>
							{/if}
						{/if}

						{#if selected.slide === 'test_bell'}
							<button
								class="btn"
								class:btn-disabled={selected.screen !== current.screen}
								on:click={() => {
									contestants.forEach(async (currentValue) => {
										await pb.collection('users').update(currentValue.id, { ring: 0 });
									});
								}}>CLEAR CHUONG</button
							>
							<button
								class="btn"
								on:click={() => {
									selected.slide = 'ques_chung';
									selected.question = 1;
									setSlide();
								}}>ques chung</button
							>
						{/if}

						{#if selected.slide === 'end_ts'}
							<button
								class="btn"
								class:btn-disabled={selected.screen === 'tt'}
								on:click={() => {
									selected.slide = `main_${current.screen}`;
									// setScreen();
									setSlide();
								}}
								>Back to main
							</button>
						{/if}

						{#if selected.slide.startsWith('pre_ques')}
							<div class="grid grid-cols-5 gap-4">
								{#each [0, 1, 2] as questionInSet}
									<div class="flex justify-between rounded-xl border px-4 py-2">
										<span class="text-2xl font-black">{questionInSet + 1}</span>
										{#each ['20', '30'] as questionPackage}
											<label class="flex items-center gap-1">
												<input
													class="radio radio-lg"
													type="radio"
													name={`Ngo Bao Khang ${questionInSet}`}
													value={questionPackage}
													bind:group={selectedContestantQuestionSet[questionInSet]}
												/>
												<span class="text-2xl">{`${questionPackage}`}</span>
											</label>
										{/each}
									</div>
								{/each}
								<button
									class="btn"
									on:click={() => {
										setQuestionSet(selected.slide.slice(11));
									}}>Set question set</button
								>
								<div class="flex items-center justify-center font-mono text-4xl">
									{selectedContestantQuestionSet.join(' ')}
								</div>
							</div>
							<div class="grid grid-cols-4 gap-4">
								{#each [0, 1, 2] as questionOffset}
									<div class="flex justify-between rounded-xl border px-4 py-2">
										<span class="text-2xl font-black">{questionOffset + 1}</span>
										{#each [1, 2, 3] as questionPackage}
											<label class="flex items-center gap-1">
												<input
													class="radio"
													type="radio"
													name={`Ngo Bao Khang OFFSET ${questionOffset}`}
													value={questionPackage}
													bind:group={selectedContestantQuestionSetOffset[questionOffset]}
												/>
												<span class="text-2xl">{`${questionPackage}`}</span>
											</label>
										{/each}
									</div>
								{/each}
								<div class="flex items-center justify-center font-mono text-4xl">
									{selectedContestantQuestionSetOffset.join(' ')}
								</div>
							</div>
							<button
								class="btn"
								on:click={() => {
									selected.slide = selected.slide.slice(4);
									selected.question = 1;
									setSlide();
								}}>To question set</button
							>
						{/if}

						{#if selected.screen === 'vcnv'}
							{#if selected.slide === 'main_vcnv'}
								<div class="grid grid-cols-7 gap-4">
									<div class="col-span-2 flex gap-3">
										{#each [1, 2, 3, 4] as item}
											<label class="flex items-center gap-1">
												<input
													class="radio radio-lg"
													type="radio"
													name="Ngo Bao Khang"
													value={item}
													bind:group={selectedObstacleRow}
												/>
												<span class="text-2xl">{item}</span>
											</label>
										{/each}
									</div>
									<button
										class="btn btn-success"
										on:click={() => {
											// sendSoundRequest('vcnv_show_row');
											if (confirm('ARE YOU SURE WANT TO SHOW THIS ANSWER?')) {
												changeRowState(selectedObstacleRow, 'correct');
												sendSoundRequest('vcnv_display_picture');
											}
										}}>Show {selectedObstacleRow}</button
									>
									<button
										class="btn btn-error"
										on:click={() => changeRowState(selectedObstacleRow, 'wrong')}
										>Wrong {selectedObstacleRow}</button
									>
									<button
										class="btn btn-primary"
										on:click={() => {
											changeRowState(selectedObstacleRow, 'selected');
											sendSoundRequest('vcnv_select_row');
										}}>Select {selectedObstacleRow}</button
									>
									<button class="btn" on:click={() => changeRowState(selectedObstacleRow, '')}
										>Unselect {selectedObstacleRow}</button
									>
									<button
										class="btn"
										on:click={() => {
											selected.slide = `ques`;
											selected.question = selectedObstacleRow;
											setSlide();
										}}
										>Go to ->
									</button>
								</div>
								<div class="grid grid-cols-4 gap-4">
									<button
										class="btn"
										on:click={() => {
											changeObstacleStartState(true);
											sendSoundRequest('vcnv_display');
										}}>Start</button
									>
									<button
										class="btn"
										on:click={() => {
											changeObstacleStartState(false);
										}}>UnStart</button
									>
									<button
										class="btn"
										on:click={() => {
											selected.slide = 'image_vcnv';
											setSlide();
										}}>Go to image</button
									>
									<button
										class="btn"
										on:click={() => {
											selected.slide = `ques`;
											selected.question = 5;
											setSlide();
										}}>Go to center ques</button
									>
								</div>
								<div class="grid grid-cols-4 gap-4">
									<button
										class="btn"
										on:click={() => {
											// setAll('correct');
											changeObstacleState(true);
											sendSoundRequest('vcnv_correct_obstacle');
										}}>Correct Obstacle</button
									>
									<button
										class="btn"
										on:click={() => {
											// setAll('');
											changeObstacleState(false);
											sendSoundRequest('vcnv_wrong');
										}}>Wrong Obstacle</button
									>
									<button
										class="btn"
										on:click={() => {
											startTimer(15000);
											sendSoundRequest('vcnv_time_cnv');
										}}>Start timer</button
									>
									<span class="flex items-center justify-center font-mono text-2xl font-semibold"
										>{formatTime2(elapsed)}s</span
									>
								</div>
							{/if}
							{#if selected.slide === 'image_vcnv'}
								<div class="grid grid-cols-4">
									<div class="col-span-2 flex gap-3">
										{#each [1, 2, 3, 4, 'center'] as item}
											<label class="flex items-center gap-1">
												<input
													class="radio radio-lg"
													type="radio"
													name="Ngo Bao Khang"
													value={item}
													bind:group={selectedObstacleImage}
												/>
												<span class="text-2xl">{item}</span>
											</label>
										{/each}
									</div>
									<button
										class="btn"
										on:click={() => {
											if (confirm('ARE YOU SURE WANT TO OPEN THIS IMAGE CORNER?')) {
												changeImageState(selectedObstacleImage, true);
												sendSoundRequest('vcnv_display_picture');
											}
										}}>Show {selectedObstacleImage}</button
									>
									<button
										class="btn"
										on:click={() => {
											changeImageState(selectedObstacleImage, false);
										}}>Unshow {selectedObstacleImage}</button
									>
								</div>
								<button
									class="btn"
									on:click={() => {
										selected.slide = `main_vcnv`;
										setSlide();
									}}
									>Back to main
								</button>
							{/if}
						{/if}
					{:else if selected.screen.startsWith('answers')}
						<div class="grid grid-cols-2 gap-4">
							<button
								class="btn"
								on:click={() => {
									sendSoundRequest(selected.screen.slice(8) + '_correct');
								}}>Đúng</button
							>
							<button
								class="btn"
								on:click={() => {
									sendSoundRequest(selected.screen.slice(8) + '_wrong');
								}}>Sai</button
							>
						</div>
						<button
							class="btn"
							class:btn-disabled={selected.screen !== current.screen}
							on:click={() => {
								if (selected.screen === 'answers_tt') selected.question++;
								else selected.slide = 'main_vcnv';
								selected.screen = selected.screen.slice(8);
								setScreen();
							}}
							>Back to ques
						</button>
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
				<button
					title="Emoji"
					class="btn btn-circle btn-sm ml-auto"
					on:click|preventDefault={() => {}}
				>
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
