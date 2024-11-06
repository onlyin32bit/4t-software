<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';
	import { fade, slide, scale } from 'svelte/transition';
	import logo from '$lib/image/4t.png';
	import { typewriter } from '$lib/transitions';

	let questions: { question: string; file_type: string }[] = [];
	let fileNames: string[] = [];
	let screen: string = 'tt';
	let scr_slide: string = 'start';
	let ques: number = 1;
	let time: number = 10;
	let displayQuestion: boolean = false;
	let displayQuestionContent: boolean = false;

	let unsub: (() => void)[] = [];
	onMount(async () => {
		const displayStatus = await pb.collection('display_status').getOne('4T-DISPLAYSTATE');
		screen = displayStatus.screen;
		scr_slide = displayStatus.slide;
		ques = displayStatus.ques;

		const questionList = await pb.collection('tt').getOne('4T-QUESTIONS-TT');

		questions = questionList.question;
		fileNames = questionList.files;

		unsub[0] = await pb.collection('display_status').subscribe('*', ({ action, record }) => {
			if (action === 'update') {
				screen = record.screen;
				scr_slide = record.slide;
				ques = record.ques;
				if (displayQuestion !== record.displayQuestion) {
					displayQuestion = true;
				}
				// if (record.timer != -1) timer();
			}
		});
	});

	onDestroy(() => {
		unsub.forEach((currentValue) => {
			currentValue?.();
		});
	});

	let containerHeight: number;
	let textHeight: number;
	let fontSize: number = 1;

	function getFileUrl(url: string): string {
		return pb.baseUrl + '/api/files/tt/4T-QUESTIONS-TT/' + url;
	}

	function calcPercent(x: number, y: number): number {
		return (x / y) * 100;
	}

	$: if (calcPercent(textHeight, containerHeight) < 53) {
		fontSize += 0.5;
	}

	$: {
		ques;
		time = 15;
		displayQuestion = false;
		fontSize = 1;
	}

	$: if (screen != 'tt') goto('/display/' + screen);
</script>

<div class="pointer-events-none h-screen w-screen select-none bg-black text-white">
	{#if scr_slide === 'start'}
		<div class="fixed h-full w-full bg-bg-3 bg-cover bg-no-repeat" out:fade>
			<img class="center-element fixed h-[50vh]" src={logo} alt="Logo 4T" in:fade />
		</div>
	{:else if scr_slide === 'rule'}
		<div
			class="fixed h-screen w-screen bg-bg-rule bg-contain bg-center bg-no-repeat"
			in:slide={{ duration: 2000 }}
		>
			<h1
				class="text fixed left-1/2 top-0 z-50 -translate-x-1/2 font-header-text text-[8vh] text-yellow-300"
				in:typewriter={{ delay: 200, speed: 0.5 }}
			>
				TĂNG TỐC
			</h1>
			<div
				class="fixed left-1/2 top-[17vh] z-50 w-[70vw] -translate-x-1/2 text-left font-futuristic text-[3.6vh] text-white"
			>
				<p class="whitespace-pre-wrap" in:typewriter={{ delay: 2100, speed: 7 }}>
					{`    	Trong vòng 30 giây, các thí sinh cùng trả lời bằng máy tính:
• Thí sinh trả lời đúng và nhanh nhất được 40 điểm.
• Thí sinh trả lời đúng và nhanh thứ 2 được 30 điểm.
• Thí sinh trả lời đúng và nhanh thứ 3 được 20 điểm.
• Thí sinh trả lời đúng và nhanh thứ 4 được 10 điểm.
		Phần thi sẽ có 4 câu hỏi:
• 1 câu hỏi IQ-Logic bao gồm các dạng: Tìm số thích hợp điền vào chỗ trống, tìm hình khác nhất, tìm hình còn thiếu, giải mật mã,…
• 2 câu hỏi dữ kiện: các dữ kiện sẽ lần lượt xuất hiện với độ khó giảm dần. Dựa vào đó, thí sinh sẽ trả lời các câu hỏi như: Đây là ai? Đây là địa danh nào? Đây là gì?...
• 1 câu hỏi sắp xếp bao gồm ghép nối các dữ kiện theo từng cặp hoặc sắp xếp theo một thứ tự nhất định.`}
				</p>
			</div>
		</div>
	{:else if scr_slide === 'ques'}
		<!-- <div >
			<div
				class="fixed bottom-[7vh] h-[84vh] w-[80vw] rounded-[1vh] bg-slate-950 bg-bg-kd bg-contain bg-center bg-no-repeat"
				bind:clientHeight={containerHeight}
			>
				<div class="absolute left-[4.3vw] top-[6vh]">
					<img class="h-[11vh] scale-x-[130%]" src="/src/lib/image/quesFrame.png" alt="" />
					<span
						class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[56%] font-number-display text-[9vh] text-black"
						>{ques}</span
					>
				</div>
				<div
					class="absolute left-1/2 top-1/2 z-50 w-[70vw] -translate-x-1/2 -translate-y-1/2 text-center font-semibold"
					style={`font-size: ${fontSize}vh;`}
					bind:clientHeight={textHeight}
				>
					<div class:invisible={!displayQuestion}>
						{questions[ques - 1]}
					</div>
				</div>
			</div>
			<div
				class="fixed bottom-[7vh] right-[2vw] flex h-[18vh] w-[14vw] items-center justify-center rounded-[1vh] bg-slate-950 text-[13vh] font-bold"
			>
				{time}
			</div>
		</div> -->
		<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat text-[10vh]">
			<div class="relative h-[8vh] w-screen bg-black"></div>
			<div class="rounded-full">{ques}</div>
			<div class="">{questions[ques - 1]?.question}</div>
			<div class:invisible={!displayQuestion}>
				{#if questions[ques - 1]?.file_type === 'png'}
					<img src={getFileUrl(fileNames[ques - 1])} alt={fileNames[ques - 1]} />
				{:else}
					<!-- svelte-ignore a11y-media-has-caption -->
					<video src={getFileUrl(fileNames[ques - 1])} muted autoplay> </video>
				{/if}
			</div>
			<!-- <p>{file_names[ques - 1]}</p> -->
		</div>
	{:else if scr_slide === 'end'}
		<div></div>
	{/if}
</div>
``
