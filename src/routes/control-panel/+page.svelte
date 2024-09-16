<script lang="ts">
	import { getCurrentTime, createLogMessage, dict, timerSettings, playSound } from '$lib/utils';
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
	let selection: string;
	$: if (selected.screen === 'kd') {
		selected.numberOfQues = 12;
	} else if (selected.screen === 'tt' || selected.screen === 'vd') {
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

	let selectedScore: number[] = [0, 0, 0, 0];

	let prevScreen: string;

	let time: number = 0;

	let menu = {
		setContestantName: false,
		tooltip: false,
		setScore: false
	};

	let selectionSlideList = ['start', 'rule', 'main_vcnv', 'ques', 'end'];

	let contestant_name: string[] = [];
	let contestant_class: string[] = [];

	let unsub: (() => void)[] = [];
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
	onDestroy(() => {
		// unsubscibe from riel time db
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
		time = (timerSettings.get(current.screen) ?? 0) * 1000;
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
				time: getCurrentTime(),
				from: 'system',
				type: 'SCORE',
				content: message
			});
			selectedScore = [0, 0, 0, 0];
		}
	}
	async function setRingSound() {}
	async function resetAllValue() {
		let systemLog: string = 'Đã cập nhật tên thí sinh: ';
		contestant_name.forEach(async (currentValue, i) => {
			systemLog += i + 1 + ': ' + currentValue + '-' + contestant_class[i] + (i === 3 ? '' : ' | ');
			await pb.collection('users').update('4t-contestant-' + (i + 1), {
				name: currentValue,
				class: contestant_class[i],
				answer: '',
				time: 0,
				score: 0,
				ring: false
			});
		});

		createLogMessage({
			time: getCurrentTime(),
			from: 'system',
			type: 'UPDATE: DB',
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
	function download(filename: string, text: string) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
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
			'log_4t_' + getCurrentTime().slice(0, 10).replaceAll('/', '-'),
			content + '\n' + '#END LOG'
		);
	}
	async function clearLog() {
		if (confirm('U sure?')) {
			await pb.collection('log').update('4t-global-logs0', {
				logs: []
			});
		}
	}
</script>

<svelte:head>
	<title>Bảng điều khiển | BTC 4T</title>
</svelte:head>

{#if $user && $user.username.startsWith('user_kt')}
	<section class="h-screen w-screen">
		<div class="grid h-full grid-cols-2 grid-rows-[50px_1fr_1fr_50px] border-[3px] border-gray-400">
			<div class="flex justify-between border-[3px] border-gray-400 p-2">
				<h1 class="text-xl font-semibold">Control Panel - Thách Thức Trí Tuệ mùa 8</h1>
				<div class="space-x-4">
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
					Current: {dict.get(current.screen)}
					{dict.get(current.slide)}
					{current.numberOfQues == -1 ? '' : current.question + '/' + current.numberOfQues}.
				</h1>
				<h1>Selected: {selection}</h1>
				<h1>Previous: {dict.get(prevScreen)}</h1>
			</div>
			<div class="row-span-2 flex flex-col border-[3px] border-gray-400">
				<div class="mt-1 flex h-full flex-col-reverse overflow-auto">
					<table class="table table-pin-rows table-xs mb-auto">
						<thead>
							<tr>
								<th class="w-40">Thời gian</th>
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
				<table
					class="table table-zebra table-md w-full min-w-[500px] rounded-none border-[3px] border-gray-400 outline-[3px] outline-blue-500 focus:outline"
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
							<tr
								on:mousemove={() => {
									console.log(contestant.name);
								}}
							>
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
								<td class="flex items-center justify-between gap-2 font-mono text-[20px]">
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
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<div class="grid grid-cols-[1fr_1fr_1fr_50px]">
					<button
						class="border-[3px] border-gray-400 transition-colors hover:bg-gray-200"
						on:click={() => (menu.setContestantName = !menu.setContestantName)}
						>Set tên thí sinh</button
					>
					<button
						class="border-[3px] border-gray-400 transition-colors hover:bg-gray-200"
						on:click={setScore}
						>Set điểm
					</button>
					<button
						class="border-[3px] border-gray-400 transition-colors hover:bg-gray-200"
						on:click={() => {
							selectedScore = [0, 0, 0, 0];
						}}
						>Bỏ chọn điểm
					</button>
					<button class="border-[3px] border-gray-400 p-2 hover:bg-gray-200"
						><img src="https://cdn-icons-png.flaticon.com/512/929/929872.png" alt="" /></button
					>
				</div>
			</div>
			<div class="border-[3px] border-gray-400">
				<!-- dieu khien man hinh -->
				<div role="tablist" class="tabs tabs-lifted rounded-lg bg-gray-100">
					{#each ['main', 'answers', 'scores', 'kd', 'tt', 'vcnv', 'vd'] as item}
						<button
							class="tab transition-colors duration-300 [--tab-bg:white]"
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
							{dict.get(item)}
						</button>
					{/each}
				</div>
				<div class="grid grid-cols-1 grid-rows-3 gap-4 p-4">
					<!-- {#if selected.screen !== current.screen}
						<button class="btn" on:click={changeScreen}>Switch To This Screen</button>
					{/if} -->
					<!-- chon slide -->
					{#if selected.screen === 'kd' || selected.screen === 'tt' || selected.screen === 'vcnv'}
						<div class="grid grid-cols-[50px_1fr_50px_1fr] gap-4 xl:grid-cols-[75px_1fr_75px_1fr]">
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
									setSlide();
								}}>{'<'}</button
							>
							<select class="select select-bordered select-md" bind:value={selected.slide}>
								{#each selectionSlideList as value}
									{#if selected.screen === 'vcnv'}
										<option {value}>{dict.get(value)}</option>
									{:else}
										<option {value}>{dict.get(value)}</option>
									{/if}
								{/each}
							</select>
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
							<button
								class="btn"
								on:click={() => {
									playSound('kd_start');
								}}
								>Display question
							</button>
							<button
								class="btn"
								class:btn-disabled={time > 0 || selected.screen !== current.screen}
								on:click={startTimer}>Start timer</button
							>
							<span class="font-mono text-xl font-semibold">{(time / 1000).toFixed(2)}s</span>
						</div>
					{/if}
				</div>
			</div>
			<div class="col-span-2 border-[3px] border-gray-400">
				<form class="flex h-full items-center gap-4 pr-4">
					<input
						class="w-full px-4 text-lg"
						type="text"
						placeholder="Nhập tin nhắn, nhấn Enter để gửi"
						bind:value={messageContent}
						class:input-error={!messageContent}
						on:keydown={(e) => {
							if (e.keyCode === 13) createMessage();
						}}
					/>
					<!-- <button type="submit">SUBMIT</button> -->
					<button class="btn btn-circle btn-sm" on:click|preventDefault={() => {}}></button>
				</form>
			</div>
		</div>
		<!-- on:submit|preventDefault={createMessage} -->
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
	{#if menu.tooltip}
		<div class="fixed" style={``}></div>
	{/if}
{:else}
	<h1>Đăng nhập hoặc sử dụng tài khoản BTC để tiếp tục</h1>
	<a href="/">Quay về</a>
{/if}
