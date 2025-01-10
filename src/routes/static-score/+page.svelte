<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';
	import type { RecordModel } from 'pocketbase';

	let contestants: RecordModel[] = [];

	let unsub: (() => void)[] = [];
	onMount(async () => {
		const userList = await pb.collection('users').getFullList();
		contestants = userList;

		unsub = [
			await pb.collection('users').subscribe('*', ({ action, record }) => {
				if (action === 'update')
					contestants = contestants.map((currentValue) =>
						currentValue.id === record.id ? record : currentValue
					);
			})
		];
	});
	onDestroy(() => unsub.forEach((currentValue) => currentValue?.()));
</script>

<!-- main display -->
<div class="h-screen w-screen bg-bg-2 bg-cover bg-no-repeat text-[6vh] text-white">
	<img class="fixed right-[9vw] top-[3vh] h-[10vh]" src="/src/lib/image/4t.png" alt="Logo 4T" />
	<img
		class="fixed right-[2vw] top-[3vh] h-[10.5vh]"
		src="/src/lib/image/logo-cbt.png"
		alt="Logo THPT Chuyen Ben Tre"
	/>
	<h1
		class="fixed top-[11vh] w-screen text-center text-[18vh] font-extrabold"
		style={`text-shadow: 0.1vh 0.5vh 1vh rgba(103, 103, 140, 1);`}
	>
		BẢNG ĐIỂM
	</h1>
	<div class="fixed left-1/2 top-[40vh] flex -translate-x-1/2 gap-[2.5vw] font-header">
		{#each contestants as contestant, i}
			<div
				class="w-[22vw] border-[0.8vh] border-slate-200 text-[4.9vh]"
				style={`filter: drop-shadow(8px 28px 32px #335); ${contestant.ring > 0 ? 'outline: 2vh solid red' : ''}`}
				in:scale={{ delay: i * 100 }}
			>
				<div
					class="left-1/2 flex h-[8vh] items-center justify-center bg-gradient-to-l from-[#00bfff] via-[#00fdff] to-[#00bfff] font-black text-[#2632b1]"
				>
					{contestant.name.toUpperCase()}
				</div>
				<div
					class="flex h-[25vh] items-center justify-center text-[15vh] font-black"
					style={`background: radial-gradient(circle, rgba(18,32,177,1) 0%, rgba(31,31,83,1) 100%);`}
				>
					<div in:fade={{ duration: 1000 }}>{contestant.score}</div>
				</div>
			</div>
		{/each}
	</div>
</div>
