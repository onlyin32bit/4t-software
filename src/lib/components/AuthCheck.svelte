<script lang="ts">
	import { user } from '$lib/pocketBase';
	export let needBTC = false;
</script>

{#if $user && !(needBTC != $user.username.startsWith('user_kt'))}
	<slot></slot>
{:else}
	<div class="flex h-screen flex-col items-center justify-center gap-8">
		<img src="src/lib/image/4t.png" alt="4T logo" class="h-[150px]" />
		<h1 class="text-2xl font-semibold">
			{needBTC ? 'Sử dụng tài khoản BTC' : 'Đăng nhập'} để tiếp tục
		</h1>
		<a class="link-hover" href="/">Quay về</a>
	</div>
{/if}
