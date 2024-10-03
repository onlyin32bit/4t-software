<script lang="ts">
	import { user } from '$lib/pocketBase';
	import { onMount } from 'svelte';
	export let btc = false;
	let promise = Promise.resolve(null);
	onMount(() => {
		promise = load();
	});
	const load = () => new Promise<null>((resolve) => setTimeout(() => {}, 1000));
</script>

{#await promise}
	<span class="loading loading-infinity loading-lg"></span>
{:then value}
	<slot />
{:catch error}
	<div>error</div>
{/await}
