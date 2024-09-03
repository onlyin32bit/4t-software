<script>
	import '../app.css';
</script>

<div>
	<!-- <nav class="p-4">
		<div class="flex h-12 w-auto items-center justify-center rounded-xl bg-slate-50 px-8 shadow-md">
			<div>logo</div>
			<div class="ml-auto [&>*]:ml-4">
				<a href="/">Trang chu</a>
				<a href="/staffs">Doi ngu thuc hien</a>
				<a href="/info">Thong tin</a>
				<a href="/contact">Lien he</a>
			</div>
		</div>
	</nav> -->
	<main class="px-4 min-h-svh">
		<slot />
	</main>
</div>
