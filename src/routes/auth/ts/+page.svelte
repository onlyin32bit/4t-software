<script lang="ts">
	import { pb, user } from '$lib/pocketBase';
	import { goto } from '$app/navigation';

	let username: string;
	let password: string;

	async function login() {
		await pb.collection('users').authWithPassword(username, password);
	}
	// console.log($user);
</script>

<svelte:head>
	<title>Đăng nhập thí sinh</title>
</svelte:head>

<a href="/">Home</a>
{#if !$user}
	<form on:submit|preventDefault={login} class="space-x-4">
		<label>
			Username
			<input placeholder="Nhập tên đăng nhập" name="username" type="text" bind:value={username} />
		</label>
		<label>
			Password
			<input placeholder="Nhập mật khẩu" name="password" type="password" bind:value={password} />
		</label>
		<button>Log in</button>
	</form>
{:else}
	<h1>Logged in as {$user.name}</h1>
	<button on:click={() => pb.authStore.clear()}>Log out</button>
{/if}
