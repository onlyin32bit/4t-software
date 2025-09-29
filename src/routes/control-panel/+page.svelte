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
	import { socket } from '$lib/socket.io-client';

	let contestants: RecordModel[] = [];
	let otherUsers: RecordModel[] = [];
	let logs: RecordModel[] = [];
	let messageContent: string = '';

	let current: DisplayObject = {
		screen: '',
		slide: '',
		question: -1,
		numberOfQuestion: -1
	};

	let selected: DisplayObject = { ...current };
	$: selected.numberOfQuestion = getNumberOfQuestion(selected);
	$: current.numberOfQuestion = getNumberOfQuestion(current);

	function getNumberOfQuestion(displayState: DisplayObject): number {
		return (
			numberOfQues.get(
				displayState.screen +
					(displayState.screen === 'kd'
						? displayState.slide === 'ques_chung'
							? '_chung'
							: displayState.slide.startsWith('ques_ts')
								? '_rieng'
								: ''
						: '')
			) ?? 0
		);
	}

	let selectedScore: number[] = [0, 0, 0, 0];

	let prevScreen: string;

	let displayQuestionStatus: boolean;

	let playMediaSource: string;

	let bellAllowed: boolean = false;

	let elapsed: number = 0;

	let menu: string = 'main';

	let settings: { season: number; game: string; game_number: number } = {
		season: 8,
		game: 'tk',
		game_number: 1
	};

	let selectionSlideList: string[] = ['start', 'rule', 'ques', 'end'];
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
		selectionSlideList = ['start', 'rule', 'intro', 'ques', 'solve', 'end'];
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
		const otherUserListRecord = await pb.collection('btc').getFullList();
		const logsRecord = await pb.collection('logs').getFullList();
		const displayStatusRecord = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		// const settingsRecord = await pb.collection('settings').getOne('GLOBAL-SETTINGS');

		contestants = userListRecord;
		otherUsers = otherUserListRecord;
		logs = logsRecord;
		current = {
			screen: displayStatusRecord.screen,
			slide: displayStatusRecord.slide,
			question: displayStatusRecord.ques,
			numberOfQuestion: -1
		};
		selected = { ...current };
		displayQuestionStatus = displayStatusRecord.displayQuestion;
		bellAllowed = displayStatusRecord.bellAllowed;
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
				} else if (action === 'delete') logs = logs.filter(({ id }) => id !== record.id);
			}),
			await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
				if (action === 'update') {
					if (current.screen !== record.screen) current.screen = record.screen;
					if (current.slide !== record.slide) current.slide = record.slide;
					if (current.question !== record.ques) current.question = record.ques;

					if (bellAllowed !== record.bellAllowed) bellAllowed = record.bellAllowed;
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
			if (selected.screen === 'vcnv' && selected.slide === 'intro') resetAllStateVCNV();
			if (displayQuestionStatus) setDisplayQuestionStatus(false);
			changeStarState(false);
			stopTimer = true;
		}
	}
	async function setQuestion() {
		if (selected.question !== current.question) {
			await pb.collection('display_status').update('4T-DISPLAYSTATE', {
				ques: selected.question,
				timer: -1
			});
			if (selected.screen === 'kd' && selected.slide === 'ques_chung') {
				clearContestantBell();
				setBellAllow(true);
			}
			if (selected.question > current.numberOfQuestion) sendSoundRequest('stop_bg_music');
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

	async function setBellAllow(value: boolean) {
		if (bellAllowed === value) return;
		await pb.collection('display_status').update('4T-DISPLAYSTATE', {
			bellAllowed: value
		});
		createLogMessage('system', 'INFO', `Đã ${value ? 'mở' : 'đóng'} chuông`);
	}

	async function clearContestantAnswer(log: boolean = false) {
		contestants.forEach(async ({ id }) => {
			await pb.collection('users').update(id, { answer: null, time: 0 });
		});
		if (log) createLogMessage('system', 'INFO', 'Đã xóa đáp án thí sinh');
	}

	async function clearContestantBell() {
		if (contestants.findIndex(({ ring }) => ring > 0) === -1) return;
		contestants.forEach(async ({ id }) => {
			await pb.collection('users').update(id, { ring: 0 });
		});
		socket.emit('bell', 'clear');
		createLogMessage('system', 'INFO', 'Đã xóa chuông thí sinh');
	}

	function setContestantWrongState() {
		selectedContestantsWrongState.forEach(async (currentValue) => {
			await pb.collection('users').update(currentValue, { wrong: true });
		});
	}

	function clearContestantWrongState() {
		contestants.forEach(async ({ id }) => {
			await pb.collection('users').update(id, { wrong: false });
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

	async function changeRowState(rowIndex: number, state: string) {
		await pb.collection('display_status_vcnv').update('4T-DISPLAYSTATE', {
			[rowIndex]: state
		});
		if (state === 'correct')
			createLogMessage('system', 'INFO', `Đã mở hàng ngang thứ ${rowIndex} VCNV`);
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

	async function resetContestantQuestionSet() {
		for (let contestant = 1; contestant <= 4; contestant++) {
			await pb.collection('display_status_vd').update('4T-DISPLAYSTATE', {
				[contestant]: { offset: [0, 0, 0], question_set: [] }
			});
		}
	}

	async function changeStarState(state: boolean) {
		await pb.collection('display_status_vd').update('4T-DISPLAYSTATE', {
			star: state
		});
	}

	function saveLog() {
		let logContent = '#START LOG';
		logs.forEach(
			({ time, from, type, content }) =>
				(logContent += `\n${time}: <${from}> [${type}]: ${content}`)
		);
		download(
			`4TMua${settings.season}-LOG-${settings.game.toUpperCase()}${settings.game === 'ck' ? '' : '-' + settings.game_number}`,
			`${logContent}\n#END LOG`
		);
	}
	function clearLog() {
		if (confirm('Confirm?')) {
			logs.forEach(async ({ id }) => {
				await pb.collection('logs').delete(id);
			});
			logs = [];
			toast.success('Đã xóa Log');
		}
	}
	let selectedObstacleRow: number = 1;
	let selectedObstacleImage: number | 'center' = 1;
	let selectedContestantQuestionSet: string[] = [];
	let selectedContestantQuestionSetOffset: number[] = [1, 2, 3];
	let selectedContestantsWrongState: string[] = [];
</script>

<svelte:head>
	<title>Bảng điều khiển | BTC 4T</title>
</svelte:head>

<Toaster closeButton richColors position="top-right" />

<AuthCheck requiredBTC={true}>
	<section class="w-screen h-screen overflow-hidden">
		<div
			class="grid h-full grid-cols-[1fr_1.3fr] grid-rows-[50px_1fr_1fr_50px] border-[3px] border-gray-400"
		>
			<!-- header -->
			<div class="flex items-center justify-between border-[3px] border-gray-400 p-2">
				<div class="flex items-center gap-4 text-xl font-semibold">
					<a href="/"><img src="/src/lib/image/4t-blue.png" alt="Logo 4T" class="h-10" /></a>
					<h1>CONTROL PANEL - THÁCH THỨC TRÍ TUỆ MÙA {settings.season}</h1>
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
				<div class="flex flex-col-reverse h-full mt-1 overflow-auto" bind:this={logsElement}>
					<table class="table mb-auto table-pin-rows table-sm">
						<thead class="border-b-2">
							<tr>
								<th class="w-32">Thời gian</th>
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
						<table class="table w-full table-zebra table-md">
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
					{:else if menu === 'other-accounts'}
						<div>
							{#each otherUsers as { name, online }}
								<div>{name}: {online}</div>
							{/each}
						</div>
					{:else}
						<div
							class="grid h-full grid-cols-[12rem_1fr_7rem_3rem_1fr_3rem] grid-rows-[30px_1fr_1fr_1fr_1fr]"
						>
							<div class="flex items-center px-3 py-1 text-xs font-bold text-gray-400 border-b-2">
								TÊN THÍ SINH
							</div>
							<div class="flex items-center px-3 py-1 text-xs font-bold text-gray-400 border-b-2">
								CÂU TRẢ LỜI
							</div>
							<div
								class="flex items-center justify-center px-3 py-1 text-xs font-bold text-gray-400 border-b-2"
							>
								THỜI GIAN
							</div>
							<div
								class="flex items-center justify-center col-span-3 px-3 py-1 text-xs font-bold text-gray-400 border-b-2"
							>
								ĐIỂM
							</div>
							{#each contestants as contestant, contestantIndex (contestant.id)}
								<div
									class="flex items-center gap-2 px-3 text-xl font-semibold border-b-2"
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
								<div class="flex items-center px-3 text-lg border-b-2">
									{contestant.answer === '' ? 'Chưa có câu trả lời' : contestant.answer}
								</div>
								<div class="flex items-center justify-center font-mono text-xl border-b-2">
									{contestant.time === -2
										? 'ended'
										: contestant.time === -1
											? 'running'
											: formatTime2(contestant.time)}
								</div>
								<button
									class="w-full h-full text-3xl font-light text-gray-400 transition-colors bg-slate-100 hover:bg-blue-100"
									on:click={() => {
										selectedScore[contestantIndex] -= 5;
									}}>-</button
								>
								<div class="flex items-center justify-center border-b-2">
									<div class="flex font-mono text-3xl translate-x-6">
										{#key contestant.score}
											<div class="relative">
												<span
													class="absolute right-0 font-bold"
													in:fly={{ y: 20 }}
													out:fly={{ y: -20 }}>{contestant.score}</span
												>
											</div>
										{/key}
										<div class="flex items-baseline ml-3">
											<span class="font-thin text-gray-400">
												{selectedScore[contestantIndex] >= 0 ? '+' : ''}
											</span>
											<input
												class="rounded-sm text-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
												style={`width: ${String(selectedScore[contestantIndex]).length}ch`}
												type="number"
												bind:value={selectedScore[contestantIndex]}
											/>
										</div>
									</div>
								</div>
								<button
									class="w-full h-full text-3xl font-light text-gray-400 transition-colors bg-slate-100 hover:bg-blue-100"
									on:click={() => {
										selectedScore[contestantIndex] += 10;
									}}>+</button
								>
							{/each}
						</div>
					{/if}
				</div>
				<div class="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.3fr]">
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
					<button
						class="btn"
						on:click={() => {
							setBellAllow(bellAllowed ? false : true);
						}}
						>{#if bellAllowed}
							<svg class="h-5" viewBox="0 0 640 512"
								><path
									d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7l-90.2-70.7c.2-.4 .4-.9 .6-1.3c5.2-11.5 3.1-25-5.3-34.4l-7.4-8.3C497.3 319.2 480 273.9 480 226.8l0-18.8c0-77.4-55-142-128-156.8L352 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 19.2c-42.6 8.6-79 34.2-102 69.3L38.8 5.1zM406.2 416L160 222.1l0 4.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S115.4 416 128 416l278.2 0zm-40.9 77.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
								/></svg
							>
						{:else}
							<svg class="h-5" fill="#000" viewBox="0 0 448 512">
								<path
									d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
								/>
							</svg>
						{/if}{bellAllowed ? 'DIS' : ''}ALLOW BELL</button
					>
				</div>
			</div>

			<!-- dieu khien man hinh -->
			<div class="select-none border-[3px] border-gray-400">
				<div class="grid h-16 grid-flow-col text-xl border-b-2">
					{#each ['', 'main', 'logo', 'answers_tt', 'answers_vcnv', 'scores', 'kd', 'vcnv', 'tt', 'vd', 'extra'] as screen}
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
							<select class="text-xl select select-bordered select-md" bind:value={selected.slide}>
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
								><svg class="h-5" viewBox="0 0 512 512"
									><path
										d="M352 0c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9L370.7 96 201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L416 141.3l41.4 41.4c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-128c0-17.7-14.3-32-32-32L352 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z"
									/></svg
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
								{#if selected.question > selected.numberOfQuestion}
									<div class="text-4xl font-bold text-center">ENDED</div>
								{:else}
									<div class="flex justify-center">
										<input
											class="input input-md input-bordered w-32 text-2xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
											type="number"
											min="1"
											max={current.numberOfQuestion}
											bind:value={selected.question}
										/>
										<div class="flex flex-col w-8">
											<button
												class="btn btn-xs"
												class:btn-disabled={selected.question >= selected.numberOfQuestion}
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
									class:btn-disabled={selected.question > current.numberOfQuestion ||
										(selected.screen !== 'kd' && selected.question >= current.numberOfQuestion) ||
										selected.screen !== current.screen}
									on:click={() => {
										selected.question += 1;
										setQuestion();
									}}>{selected.question >= selected.numberOfQuestion ? 'END' : '>'}</button
								>
								<button
									class="btn"
									class:btn-disabled={selected.screen !== current.screen ||
										selected.question === current.question}
									on:click={setQuestion}
									><svg class="h-5" viewBox="0 0 512 512"
										><path
											d="M352 0c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9L370.7 96 201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L416 141.3l41.4 41.4c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-128c0-17.7-14.3-32-32-32L352 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z"
										/></svg
									>Jump To Question</button
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
									}}
									><svg class="h-5" viewBox="0 0 576 512"
										><path
											d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
										/></svg
									>NSHV</button
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
									><svg class="h-5" viewBox="0 0 384 512"
										><path
											d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
										/></svg
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
										selected.question < selected.numberOfQuestion}
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
											// clearContestantBell();
											if (selected.question < current.numberOfQuestion) {
												selected.question += 1;
												setQuestion();
											}
										}
										sendSoundRequest(selected.screen + '_correct');
									}}
									><svg class="h-5" viewBox="0 0 448 512"
										><path
											d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
										/></svg
									>Đúng</button
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
									}}
									><svg class="h-5" viewBox="0 0 384 512"
										><path
											d="M32 0C14.3 0 0 14.3 0 32S14.3 64 32 64l0 11c0 42.4 16.9 83.1 46.9 113.1L146.7 256 78.9 323.9C48.9 353.9 32 394.6 32 437l0 11c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0 256 0 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-11c0-42.4-16.9-83.1-46.9-113.1L237.3 256l67.9-67.9c30-30 46.9-70.7 46.9-113.1l0-11c17.7 0 32-14.3 32-32s-14.3-32-32-32L320 0 64 0 32 0zM96 75l0-11 192 0 0 11c0 19-5.6 37.4-16 53L112 128c-10.3-15.6-16-34-16-53zm16 309c3.5-5.3 7.6-10.3 12.1-14.9L192 301.3l67.9 67.9c4.6 4.6 8.6 9.6 12.1 14.9L112 384z"
										/></svg
									>{elapsed > 0 ? 'Stop' : 'Start'} timer</button
								>
								<button
									class="btn"
									on:click={() => {
										if (current.screen === 'kd') {
											// clearContestantBell();
											if (selected.question < current.numberOfQuestion) {
												selected.question += 1;
												setQuestion();
											}
										}
										sendSoundRequest(current.screen + '_wrong');
									}}
									><svg class="h-5" viewBox="0 0 384 512"
										><path
											d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
										/></svg
									>Sai</button
								>
								<button
									class="btn"
									on:click={() => {
										sendSoundRequest('space');
									}}>Dấu ...</button
								>
								<button
									class="btn"
									class:btn-disabled={['kd', 'vd'].includes(selected.screen) ||
										selected.screen !== current.screen}
									on:click={() => {
										selected.screen = `answers_` + selected.screen;
										selectedContestantsWrongState = [];
										setScreen();
									}}
									>Go to answer
								</button>
								<button
									class="btn"
									class:btn-disabled={selected.screen !== 'vd'}
									on:click={() => {
										startTimer(5);
										sendSoundRequest('vd_time_5');
										setBellAllow(true);
										setTimeout(() => {
											setBellAllow(false);
										}, 5000);
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
										setBellAllow(true);
										selected.slide = 'test_bell';
										setSlide();
									}}
									>Ques chung (Test chuong truoc)
								</button>
							{:else}
								<button
									class="btn"
									on:click={() => {
										resetContestantQuestionSet();
									}}
									>CLEAR QUES SET
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
									<div class="flex justify-between px-4 py-2 border rounded-xl">
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
									on:click={async () => {
										setQuestionSet(selected.slide.slice(11));
										for (let i = 0; i < 3; i++) {
											// setTimeout(() => {
											sendSoundRequest('vd_choose_choice');
											// }, i * 500);
											await new Promise((resolve) => setTimeout(resolve, 500));
										}
									}}>Set question set</button
								>
								<div class="flex items-center justify-center font-mono text-4xl">
									{selectedContestantQuestionSet.join(' ')}
								</div>
							</div>
							<div class="grid grid-cols-4 gap-4">
								{#each [0, 1, 2] as questionOffset}
									<div class="flex justify-between px-4 py-2 border rounded-xl">
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
									<div class="flex col-span-2 gap-3">
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
												// sendSoundRequest('vcnv_display_picture');
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
									<div class="flex col-span-2 gap-3">
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
						<div class="grid grid-cols-[3fr_1fr]">
							<div class="grid grid-cols-4">
								{#each contestants as { name, id }}
									<label class="flex gap-2">
										<input
											type="checkbox"
											class="checkbox checkbox-lg"
											value={id}
											bind:group={selectedContestantsWrongState}
										/>
										<span class="text-lg 2xl:text-2xl">{name}</span>
									</label>
								{/each}
							</div>
							<button
								class="btn"
								on:click={() => {
									setContestantWrongState();
								}}>Set dap an thi sinh sai</button
							>
						</div>
						<button
							class="btn"
							class:btn-disabled={selected.screen !== current.screen}
							on:click={() => {
								if (confirm('Quay lai?')) {
									if (selected.screen === 'answers_tt') selected.question++;
									else selected.slide = 'main_vcnv';
									selected.screen = selected.screen.slice(8);
									setScreen();
									// clearContestantWrongState();
									clearContestantAnswer();
								}
							}}
							>Back to ques & clear answer
						</button>
					{:else if selected.screen === 'scores'}
						<button
							class="btn"
							on:click={() => {
								sendSoundRequest('tong_ket_diem');
							}}
							>Nhac tong ket diem
						</button>
					{/if}
				</div>
			</div>

			<div class="col-span-2 flex items-center border-[3px] border-gray-400 pr-3">
				<form class="w-full h-full" on:submit|preventDefault={createMessage}>
					<input
						class="w-full h-full px-4 text-xl"
						type="text"
						placeholder="Nhập tin nhắn, nhấn Enter để gửi"
						bind:value={messageContent}
						class:input-error={!messageContent}
					/>
				</form>
				<button
					aria-label="Emoji"
					class="ml-auto btn btn-circle btn-sm"
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
