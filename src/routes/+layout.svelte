<script lang="ts">
	import { socket } from '$lib/socket.io-client';
	import { onMount } from 'svelte';
	import { pb, user } from '$lib/pocketBase';
	import '../app.css';

	onMount(() => {
		socket.on('message', (message) => {
			console.log(message);
		});
	});

	if ($user !== null) socket.emit('knownUserAccessed', $user);
</script>

<main>
	<slot />
</main>
