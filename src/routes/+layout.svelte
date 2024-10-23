<script lang="ts">
	import { socket } from '$lib/socket-io-client';
	import { onMount } from 'svelte';
	import { pb, user } from '$lib/pocketBase';
	import '../app.css';

	onMount(() => {
		socket.on('message', (message: string) => {
			console.log('Server sent:', message);
		});

		socket.emit('message', { message: $user });
	});
</script>

<main class="">
	<slot />
</main>
