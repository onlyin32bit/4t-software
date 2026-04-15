<script>
	import Logo from './Logo.svelte';
	import Main from './Main.svelte';
	import Scores from './Scores.svelte';
	import AnswersVcnv from './AnswersVcnv.svelte';
	import AnswersTt from './AnswersTt.svelte';
	import Vd from './Vd.svelte';
	import Tt from './Tt.svelte';
	import Vcnv from './Vcnv.svelte';
	import Kd from './Kd.svelte';
	import { pb } from '$lib/pocketBase';
	import { onDestroy, onMount } from 'svelte';

	let screen = '';
	let users = [];
	let settings = {};
	let displayStatus = {};
	let displayStatusVcnv = {};
	let displayStatusVd = {};
	let kd = { chung: {}, rieng: {} };
	let vcnv = {};
	let tt = { questions: {}, solve: {} };
	let vd = {};
	let isLoading = true;
	let unsubscribers = [];

	onMount(async () => {
		// Fetch all data
		const fetches = [
			pb.collection('users').getFullList().then(u => users = u),
			pb.collection('settings').getOne('GLOBAL-SETTINGS').then(s => settings = s),
			pb.collection('display_status').getOne('4T-DISPLAYSTATE').then(ds => displayStatus = ds),
			pb.collection('display_status_vcnv').getOne('4T-DISPLAYSTATE').then(dsv => displayStatusVcnv = dsv),
			pb.collection('display_status_vd').getOne('4T-DISPLAYSTATE').then(dsd => displayStatusVd = dsd),
			pb.collection('kd').getOne('4T-QUESKD-CHUNG').then(k => kd.chung = k),
			pb.collection('kd').getOne('4T-QUESTS-RIENG').then(k => kd.rieng = k),
			pb.collection('vcnv').getOne('4T-QUES-VCNV-BK').then(v => vcnv = v),
			pb.collection('tt').getOne('4T-QUESTIONS-TT').then(t => tt.questions = t),
			pb.collection('tt').getOne('4T-QUESTT-SOLVE').then(t => tt.solve = t),
			pb.collection('vd').getOne('4T-VEDICHBANKET').then(v => vd = v),
		];
		await Promise.all(fetches);

		// Set up subscriptions
		unsubscribers.push(await pb.collection('display_status').subscribe('4T-DISPLAYSTATE', ({ action, record }) => {
			if (action === 'update' || action === 'create') {
				displayStatus = record;
				if (record.screen !== screen) screen = record.screen;
			}
		}));
		unsubscribers.push(await pb.collection('users').subscribe('*', async () => {
			users = await pb.collection('users').getFullList();
		}));
		unsubscribers.push(await pb.collection('settings').subscribe('GLOBAL-SETTINGS', ({ record }) => {
			settings = record;
		}));
		unsubscribers.push(await pb.collection('display_status_vcnv').subscribe('4T-DISPLAYSTATE', ({ record }) => {
			displayStatusVcnv = record;
		}));
		unsubscribers.push(await pb.collection('display_status_vd').subscribe('4T-DISPLAYSTATE', ({ record }) => {
			displayStatusVd = record;
		}));
		unsubscribers.push(await pb.collection('kd').subscribe('4T-QUESKD-CHUNG', ({ record }) => {
			kd.chung = record;
		}));
		unsubscribers.push(await pb.collection('kd').subscribe('4T-QUESTS-RIENG', ({ record }) => {
			kd.rieng = record;
		}));
		unsubscribers.push(await pb.collection('vcnv').subscribe('4T-QUES-VCNV-BK', ({ record }) => {
			vcnv = record;
		}));
		unsubscribers.push(await pb.collection('tt').subscribe('4T-QUESTIONS-TT', ({ record }) => {
			tt.questions = record;
		}));
		unsubscribers.push(await pb.collection('tt').subscribe('4T-QUESTT-SOLVE', ({ record }) => {
			tt.solve = record;
		}));
		unsubscribers.push(await pb.collection('vd').subscribe('4T-VEDICHBANKET', ({ record }) => {
			vd = record;
		}));

		isLoading = false;
	});

	onDestroy(() => {
		unsubscribers.forEach(unsub => unsub());
	});
</script>

{#if isLoading}
	<div class="flex flex-col items-center justify-center h-screen gap-8">
		<img src="/4t.png" alt="4T logo" class="h-[150px]" />
		<span class="loading loading-ring loading-lg"></span>
	</div>
{:else}
	{#if screen === 'kd'}
		<Kd {users} {displayStatus} {kd} />
	{:else if screen === 'vcnv'}
		<Vcnv {users} {displayStatus} {displayStatusVcnv} {vcnv} />
	{:else if screen === 'tt'}
		<Tt {displayStatus} {tt} />
	{:else if screen === 'vd'}
		<Vd {users} {displayStatus} {displayStatusVd} {vd} />
	{:else if screen === 'answers_tt'}
		<AnswersTt {users} />
	{:else if screen === 'answers_vcnv'}
		<AnswersVcnv {users} />
	{:else if screen === 'scores'}
		<Scores {users} {settings} />
	{:else if screen === 'main'}
		<Main {users} {settings} />
	{:else if screen === 'logo'}
		<Logo />
	{:else}
		<div class="flex flex-col items-center justify-center h-screen gap-8">
			<img src="/4t.png" alt="4T logo" class="h-[150px]" />
		</div>
	{/if}
{/if}
