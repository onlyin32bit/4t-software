<script>
	import { page } from '$app/stores';
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center">
	<h1>Damn bro, lỗi rồi</h1>
	<h1 class="text-4xl font-semibold">{$page.status}: {$page.error?.message}</h1>
	<a class="link" href="/">Về trang chính</a>
</div>
