<script lang="ts">
	import { user } from '$lib/pocketBase';
	import type { AuthModel } from 'pocketbase';
	export let requiredBTC = false;
	const userLoadPromise: Promise<AuthModel> = new Promise((resolve) => {
		if ($user) resolve($user);
		else
			setTimeout(() => {
				resolve($user);
			}, 1000);
	});
</script>

{#await userLoadPromise}
	<div class="flex h-screen flex-col items-center justify-center gap-8">
		<img src="src/lib/image/4t-blue.png" alt="4T logo" class="h-[150px]" />
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:then user}
	{#if user && !(requiredBTC != user.username.startsWith('user_kt'))}
		<slot></slot>
	{:else}
		<div class="flex h-screen flex-col items-center justify-center gap-8">
			<img src="src/lib/image/4t.png" alt="4T logo" class="h-[150px]" />
			<h1 class="text-2xl font-semibold">
				{requiredBTC != !user ? 'Sử dụng tài khoản BTC' : 'Đăng nhập'} để tiếp tục
			</h1>
			<a class="link-hover" href="/">Quay về</a>
		</div>
	{/if}
{/await}
