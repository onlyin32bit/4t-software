<script>
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';

	onMount(async () => {
		await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
			if (action === 'update') {
				if (record.screen !== '') goto('/display/' + record.screen);
			}
		});
	});
	onDestroy(() => pb.collection('display_status').unsubscribe('4T-DISPLAYSTATE'));
</script>

<div class="flex h-screen flex-col items-center justify-center gap-8">
	<img src="src/lib/image/4t.png" alt="4T logo" class="h-[150px]" />
	<span class="loading loading-ring loading-lg"></span>
</div>
