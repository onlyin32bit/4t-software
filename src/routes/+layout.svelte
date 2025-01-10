<script lang="ts">
	import { socket } from '$lib/socket.io-client';
	import { onMount } from 'svelte';
	import { pb, user } from '$lib/pocketBase';
	import { getCurrentTime } from '$lib/utils';
	import '../app.css';

	onMount(() => {
		socket.on('message', (message) => {
			console.log(message);
		});
		socket.io.on('ping', () => {
			console.log('connection alive ' + getCurrentTime());
		});
	});

	$: if ($user !== null) socket.emit('knownUserAccessed', $user);
</script>

<div class="font-sans">
	<slot />
</div>
