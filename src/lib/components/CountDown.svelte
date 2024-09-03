<script lang="ts">
	export let time = 0;
	export let start = true;

	let savedTime = time;
	let countdown: any;

	function startCountDown() {
		if (!countdown && time > 0) {
			countdown = setInterval(() => {
				time -= 10;
				if (time <= 0) {
					clearInterval(countdown);
					countdown = null;
				}
			}, 10);
		}
	}
</script>

<div class="flex size-16 items-center justify-center rounded-full bg-slate-50 shadow-md">
	<h1 class="text-2xl font-semibold">{time}</h1>
</div>

<button
	on:click={() => {
		time = savedTime;
		startCountDown();
	}}>RESET</button
>
