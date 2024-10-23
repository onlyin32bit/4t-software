<script lang="ts">
	import { pb, user } from '$lib/pocketBase';
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';

	let username: string;
	let password: string;

	async function login() {
		await pb.collection('btc').authWithPassword(username, password);
		goto('/');
	}
</script>

<svelte:head>
	<title>Đăng nhập BTC</title>
</svelte:head>

<div class="h-screen w-screen overflow-hidden bg-gray-50">
	<!-- {#if !$user} -->
	<div
		class="center-element fixed flex h-[40vh] w-[60vw] overflow-auto rounded-xl bg-white px-8 py-7 shadow-md"
	>
		<div class="flex flex-col items-start gap-4">
			<img src="/src/lib/image/4t.png" alt="Logo 4T" class="h-20" />
			<h1 class="text-4xl font-medium">Thách Thức Trí Tuệ</h1>
			<h2>Đăng nhập ban tổ chức</h2>
			<p class="mt-auto">InDev</p>
		</div>
		<form on:submit|preventDefault={login} class="ml-auto flex w-96 flex-col items-end gap-2">
			<label class="form-control w-full max-w-xs">
				<div class="label">
					<span class="label-text">Username</span>
				</div>
				<input
					class="input input-bordered"
					placeholder="Nhập tên đăng nhập"
					name="username"
					type="text"
					bind:value={username}
				/>
			</label>
			<label class="form-control w-full max-w-xs">
				<div class="label">
					<span class="label-text">Password</span>
				</div>
				<input
					class="input input-bordered"
					placeholder="Nhập mật khẩu"
					name="password"
					type="password"
					bind:value={password}
				/>
			</label>
			<div class="mt-auto space-x-6">
				<a href="/" class="link-hover">Home</a>
				<button class="btn btn-primary" type="submit">Log in</button>
			</div>
		</form>
	</div>
	<!-- {:else}
		<div class="mx-16 my-10 space-y-2">
			<a href="/" class="link-hover">Home</a>
			<h1>Logged in as {$user.name}</h1>
			<button class="btn" on:click={() => pb.authStore.clear()}>Log out</button>
		</div> -->
	<!-- {/if} -->
</div>
