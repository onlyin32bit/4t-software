# set địa chỉ ip nội bộ ở file `.env`

test timer moi:

```html
<script>
	let elapsed = 0;
	let duration = 10000;

	function startTimer() {
		let last_time = window.performance.now();
		let frame;
		(function update() {
			frame = requestAnimationFrame(update);

			const time = window.performance.now();
			elapsed += Math.min(time - last_time, duration - elapsed);
			last_time = time;
			if (elapsed >= duration) cancelAnimationFrame(frame);
		})();
		elapsed = 0;
	}
</script>

<div>{(elapsed / 1000).toFixed(3)}s</div>
<button on:click="{startTimer}">start</button>
<button on:click="{()" ="">(elapsed = 0)}>reset</button>
```
