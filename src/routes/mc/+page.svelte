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

	let contestants: RecordModel[] = [];
	let logs: RecordModel[] = [];

	let settings: { season: number; game: string; game_number: number } = {
		season: 8,
		game: 'tk',
		game_number: 1
	};

	let unsub: (() => void)[] = [];
	// chay khi component duoc load
	onMount(async () => {
		// fetch data
		const userListRecord = await pb.collection('users').getFullList();
		const logsRecord = await pb.collection('logs').getFullList();
		// const settingsRecord = await pb.collection('settings').getOne('GLOBAL-SETTINGS');

		contestants = userListRecord;
		logs = logsRecord;
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
			})
		];
	});
	// chay khi component bi pha huy
	onDestroy(() => unsub.forEach((currentValue) => currentValue?.()));

	let logsElement: HTMLElement;
	async function scrollLogToBottom() {
		await tick();
		logsElement.scrollTop = logsElement.scrollHeight;
	}
</script>

<svelte:head>
	<title>Trang MC | BTC 4T</title>
</svelte:head>

<Toaster richColors position="top-right" />

<AuthCheck requiredBTC={true}>
	<section class="h-screen w-screen overflow-hidden">
		<div
			class="grid h-full grid-cols-[1fr_2fr] grid-rows-[50px_1fr_1fr] border-[3px] border-gray-400"
		>
			<div
				class="col-span-2 flex items-center gap-8 border-[3px] border-gray-400 p-2 text-xl font-semibold"
			>
				<a href="/"><img src="/src/lib/image/4t-blue.png" alt="Logo 4T" class="h-10" /></a>
				<h1>TRANG MC - THÁCH THỨC TRÍ TUỆ MÙA 8</h1>
			</div>
			<div class="row-span-2 flex flex-col border-[3px] border-gray-400">
				<div class="mt-1 flex h-full flex-col-reverse overflow-auto" bind:this={logsElement}>
					<table class="table table-pin-rows table-lg mb-auto">
						<thead class="border-b-2">
							<tr>
								<!-- <th class="w-48">Thời gian</th> -->
								<th class="w-36">Đến từ</th>
								<th>Nội dung</th>
							</tr>
						</thead>
						<tbody>
							{#each logs as log}
								<tr
									class={'bg-opacity-50 last:bg-green-50 last:dark:bg-green-950' +
										(log.from == 'system' ? ' bg-red-50 dark:bg-red-950' : '')}
									in:fly={{ y: 20 }}
								>
									<!-- <th class="font-mono">{log.time}</th> -->
									<td class={'font-medium ' + (log.from == 'system' ? 'text-red-700' : '')}
										>{log.from.toUpperCase()}</td
									>
									<td>{log.content}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
			<div class="row-span-2 h-full border-[3px] border-gray-400">
				<div
					class=" grid h-full grid-cols-[1fr_2fr_10rem_10rem] grid-rows-[40px_1fr_1fr_1fr_1fr] text-4xl"
				>
					<div class="flex items-center border-b-2 px-3 py-1 text-lg font-bold text-gray-400">
						TÊN THÍ SINH
					</div>
					<div class="flex items-center border-b-2 px-3 py-1 text-lg font-bold text-gray-400">
						CÂU TRẢ LỜI
					</div>
					<div
						class="flex items-center justify-center border-b-2 px-3 py-1 text-lg font-bold text-gray-400"
					>
						THỜI GIAN
					</div>
					<div
						class="col-span-1 flex items-center justify-center border-b-2 px-3 py-1 text-lg font-bold text-gray-400"
					>
						ĐIỂM
					</div>
					{#each contestants as contestant, i (contestant.id)}
						<div
							class="flex items-center gap-2 border-b-2 px-3 font-semibold"
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
								<svg class="h-10 animate-wiggle" fill="#f00" viewBox="0 0 448 512" transition:scale>
									<path
										d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"
									/>
								</svg>
							{/if}
						</div>
						<div class="flex items-center border-b-2 px-3">
							{contestant.answer === '' ? '_' : contestant.answer}
						</div>
						<div class="font-mono flex items-center justify-center border-b-2 text-5xl">
							{contestant.time === -2
								? 'ended'
								: contestant.time === -1
									? 'running'
									: formatTime2(contestant.time)}
						</div>
						<div class="flex items-center justify-center border-b-2">
							<div class="font-mono flex items-center justify-center text-6xl">
								{#key contestant.score}
									<span class="font-bold" in:fly={{ y: 20 }} out:fly={{ y: -20 }}
										>{contestant.score}</span
									>
								{/key}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>
</AuthCheck>
