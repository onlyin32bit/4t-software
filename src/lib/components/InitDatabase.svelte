<script lang="ts">
	import { pb } from '$lib/pocketBase';

	async function InitDatabase() {
		for (let index = 1; index <= 4; index++) {
			const data = {
				id: '4t-contestant-' + index,
				username: 'ts' + index,
				password: '123456',
				passwordConfirm: '123456',
				verified: true,
				online: false,
				name: 'Thi Sinh ' + index,
				class: '',
				answer: null,
				time: 0,
				score: 0,
				ring: 0
			};
			await pb.collection('users').create(data);
		}
		await pb.collection('display_status').create({
			id: '4T-DISPLAYSTATE',
			screen: 'main',
			slide: 'start',
			ques: 1,
			displayQuestion: false,
			timer: -1,
			displayed: {
				main: true,
				answer: [true, true, true, true],
				vcnv: {
					obstacle: false,
					question: [false, false, false, false, false, false, false, false]
				},
				vd: [
					{
						selected: 0
					},
					{
						selected: 0
					},
					{
						selected: 0
					},
					{
						selected: 0
					}
				]
			}
		});
	}
</script>
