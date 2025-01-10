<script lang="ts">
	import { tweened } from 'svelte/motion';

	export let questionNumber: number;
	export let questionContent: string;
	export let questionFile: string;

	let containerHeight: number = 0;
	let textHeight: number = 0;
	let fontSize: number = 3;

	function calcPercent(x: number, y: number): number {
		return (x / y) * 100;
	}

	$: if (questionNumber && calcPercent(textHeight, containerHeight) < 85) {
		fontSize += 0.2;
	}
</script>

<div class="fixed h-full w-full bg-bg-2 bg-cover bg-no-repeat">
	<div>
		<img
			class="absolute left-[10vw] w-[73vw]"
			style={`filter: drop-shadow(8px 28px 32px #335);`}
			src="/src/lib/image/bg-tt.svg"
			alt="BG"
		/>
		<div
			class="fixed bottom-[3.2vh] left-[5vw] h-[92.5vh] w-[6vw] overflow-hidden bg-gray-200 outline-8"
			style={`filter: drop-shadow(8px 28px 32px #335); border: 1vh solid #88badf;`}
		>
			<div class="absolute top-0 h-[110%] w-full" style={`background: #f00`}></div>
		</div>
		<div
			class="fixed left-[14vw] top-[7vh] h-[12vh] w-[64vw] font-semibold"
			bind:clientHeight={containerHeight}
		>
			<div
				class="absolute left-1/2 top-1/2 z-50 w-[63vw] -translate-x-1/2 -translate-y-1/2 text-center"
				style={`font-size: ${fontSize}vh; text-shadow: 3px 1px 11px rgba(103, 103, 140, 1);`}
				bind:clientHeight={textHeight}
			>
				<div class="whitespace-pre-line">
					{questionContent}
				</div>
			</div>
		</div>
		<div class="fixed bottom-[4.42vh] left-[14vw] h-[72vh] w-[65vw]">
			<img
				class="absolute left-1/2 h-full -translate-x-1/2"
				src={questionFile}
				alt={questionFile}
			/>
		</div>
	</div>
	<!-- <div>{calcPercent(textHeight, containerHeight)} {containerHeight} {textHeight} {fontSize}</div> -->
</div>
