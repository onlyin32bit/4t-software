<script lang="ts">
	import { timerSettings } from '$lib/utils';
	import { user, pb } from '$lib/pocketBase';
	import { onMount, onDestroy } from 'svelte';

	let userStats: any = $user;
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
		const displayStatus = await pb.collection('display_status').getOne('4t-displaystate');
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
		unsub[1] = await pb.collection('display_status').subscribe('*', ({ action, record }) => {
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
			}
		}, 10);
	}

	async function createAnswer() {
		if (userStats.time == -1) {
			await pb.collection('users').update(userStats.id, {
				answer: answer,
				time: timerSetting - time
			});
		}
	}
</script>

<h1>{current.screen}</h1>

<form on:submit|preventDefault={createAnswer}>
	<input
		class="textarea textarea-bordered"
		type="text"
		placeholder="Nhập câu trả lời của bạn"
		bind:value={answer}
	/>
	<button class="btn btn-primary" type="submit">Gửi câu trả lời</button>
</form>

<div>
	<span>TIMER: {time / 1000}</span>
</div>
