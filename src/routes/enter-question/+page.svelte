<script lang="ts">
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import { pb } from '$lib/pocketBase';
	import { Toaster, toast } from 'svelte-sonner';

	let roundMode = 'kd_chung';

	// Khởi động Chung variables
	let kdChungQuestions = Array(12).fill(null).map(() => ({ content: '', type: 'text', file: null as File | null }));

	// Khởi động Riêng variables
	let kdRiengQuestions = Array(4).fill(null).map(() =>
		Array(10).fill(null).map(() => ({ content: '', type: 'text', file: null as File | null }))
	);

	// Tăng Tốc variables
	let ttQuestions = Array(4).fill(null).map(() => ({ content: '', type: 'text', time: 20, file: null as File | null }));

	// VCNV variables
	let vcnvObstacle = '';
	let vcnvCenter = { content: '', answer: '', type: 'text', file: null as File | null };
	let vcnvRows = Array(4).fill(null).map(() => ({ keyword: '', content: '', char_count: 0, type: 'text', file: null as File | null }));

	// Về Đích variables
	let vdQuestions = Array(4).fill(null).map(() => ({
		20: Array(3).fill(null).map(() => ({ content: '', type: 'text', file: null as File | null })),
		30: Array(3).fill(null).map(() => ({ content: '', type: 'text', file: null as File | null }))
	}));

	let vdScores: (20 | 30)[] = [20, 30];

	// handle file input
	function handleFile(event: Event, callback: (file: File | null) => void) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			callback(target.files[0]);
		} else {
			callback(null);
		}
	}

	async function submit() {
		const formData = new FormData();
		try {
			if (roundMode === 'kd_chung') {
				const qArr = kdChungQuestions.map((q) => ({ content: q.content, type: q.type }));
				kdChungQuestions.forEach((q, i) => {
					if (q.file && q.type !== 'text') {
						const ext = q.file.name.split('.').pop() || '';
						const renamedFile = new File([q.file], `${i + 1}_ques.${ext}`, { type: q.file.type });
						formData.append('files', renamedFile);
					}
				});
				formData.append('question', JSON.stringify(qArr));
				await pb.collection('kd').update('4T-QUESKD-CHUNG', formData);

			} else if (roundMode === 'kd_rieng') {
				const qArr = kdRiengQuestions.map((tsQs) =>
					tsQs.map((q) => ({ content: q.content, type: q.type }))
				);
				kdRiengQuestions.forEach((tsQs, tsId) => {
					tsQs.forEach((q, i) => {
						if (q.file && q.type !== 'text') {
							const ext = q.file.name.split('.').pop() || '';
							const renamedFile = new File([q.file], `ts_${tsId + 1}_${i + 1}_ques.${ext}`, { type: q.file.type });
							formData.append('files', renamedFile);
						}
					});
				});
				formData.append('question', JSON.stringify(qArr));
				await pb.collection('kd').update('4T-QUESTS-RIENG', formData);

			} else if (roundMode === 'vcnv') {
				const rowsData = vcnvRows.map((r) => ({
					keyword: r.keyword,
					content: r.content,
					type: r.type,
					char_count: r.char_count
				}));
				const centerData = { content: vcnvCenter.content, answer: vcnvCenter.answer, type: vcnvCenter.type };

				vcnvRows.forEach((r, i) => {
					if (r.file && r.type !== 'text') {
						const ext = r.file.name.split('.').pop() || '';
						const renamedFile = new File([r.file], `${i + 1}_ques.${ext}`, { type: r.file.type });
						formData.append('files', renamedFile);
					}
				});

				if (vcnvCenter.file && vcnvCenter.type !== 'text') {
					formData.append('files', vcnvCenter.file);
				}

				formData.append('obstacle', vcnvObstacle);
				formData.append('rows', JSON.stringify(rowsData));
				formData.append('center_ques', JSON.stringify(centerData));
				await pb.collection('vcnv').update('4T-QUES-VCNV-BK', formData);

			} else if (roundMode === 'tt') {
				const qArr = ttQuestions.map((q) => ({ content: q.content, time: q.time }));
				ttQuestions.forEach((q) => {
					if (q.file) formData.append('files', q.file);
				});
				formData.append('question', JSON.stringify(qArr));
				await pb.collection('tt').update('4T-QUESTIONS-TT', formData);

			} else if (roundMode === 'vd') {
				const qArr = vdQuestions.map((ts) => ({
					20: ts[20].map((q) => ({ content: q.content, type: q.type })),
					30: ts[30].map((q) => ({ content: q.content, type: q.type }))
				}));
				vdQuestions.forEach((ts, tsIndex) => {
					vdScores.forEach((score) => {
						ts[score].forEach((q, qIndex) => {
							if (q.file && q.type !== 'text') {
								const ext = q.file.name.split('.').pop() || '';
								const renamedFile = new File([q.file], `ts_${tsIndex + 1}_${score}_${qIndex + 1}_ques.${ext}`, {
									type: q.file.type
								});
								formData.append('files', renamedFile);
							}
						});
					});
				});
				formData.append('question', JSON.stringify(qArr));
				await pb.collection('vd').update('4T-VEDICHBANKET', formData);
			}

			toast.success('Tải lên câu hỏi thành công!');
		} catch (error) {
			console.error(error);
			toast.error('Gặp lỗi khi tải lên, vui lòng xem console.');
		}
	}
</script>

<svelte:head>
	<title>Nhập câu hỏi | BTC 4T</title>
</svelte:head>

<Toaster richColors position="top-right" />

<AuthCheck requiredBTC={true}>
	<div class="h-screen w-screen bg-gray-50 flex flex-col p-8 overflow-y-auto">
		<div class="flex items-center justify-between border-b-2 border-gray-400 pb-4 mb-6">
			<div class="flex items-center gap-4 text-2xl font-semibold">
				<a href="/"><img src="/4t-blue.png" alt="Logo 4T" class="h-10" /></a>
				<h1>NHẬP BỘ CÂU HỎI</h1>
			</div>
			<div class="flex gap-4 items-center">
				<span class="font-bold">CHỌN PHẦN THI:</span>
				<select class="select select-bordered" bind:value={roundMode}>
					<option value="kd_chung">Khởi Động - Chung</option>
					<option value="kd_rieng">Khởi Động - Riêng</option>
					<option value="vcnv">Vượt Chướng Ngại Vật</option>
					<option value="tt">Tăng Tốc</option>
					<option value="vd">Về Đích</option>
				</select>
			</div>
		</div>

		<form on:submit|preventDefault={submit} class="flex-1 overflow-auto bg-white border-[3px] border-gray-400 p-6 shadow-sm">
			{#if roundMode === 'kd_chung'}
				<h2 class="text-xl font-bold mb-4">KHỞI ĐỘNG CHUNG</h2>
				{#each kdChungQuestions as ques, i}
					<div class="border-b-2 py-4 mb-2">
						<h3 class="font-bold">Câu {i + 1}</h3>
						<div class="grid grid-cols-[1fr_200px] gap-4 mt-2">
							<textarea class="textarea textarea-bordered w-full" bind:value={ques.content} placeholder="Nội dung câu hỏi"></textarea>
							<div class="flex flex-col gap-2">
								<select class="select select-bordered" bind:value={ques.type}>
									<option value="text">Văn bản</option>
									<option value="image">Hình ảnh</option>
									<option value="audio">Âm thanh</option>
								</select>
								{#if ques.type !== 'text'}
									<input type="file" class="file-input file-input-bordered file-input-sm w-full" on:change={(e) => handleFile(e, (f) => ques.file = f)} />
								{/if}
							</div>
						</div>
					</div>
				{/each}

			{:else if roundMode === 'kd_rieng'}
				<h2 class="text-xl font-bold mb-4">KHỞI ĐỘNG RIÊNG</h2>
				<div class="tabs tabs-boxed mb-4">
					{#each [0, 1, 2, 3] as tsId}
						<button type="button" class="tab font-bold">Thí sinh {tsId + 1}</button>
					{/each}
				</div>
				<div class="grid grid-cols-2 gap-8">
					{#each kdRiengQuestions as tsQs, tsId}
						<div class="border-[2px] border-gray-200 p-4 rounded-md">
							<h3 class="font-bold text-center bg-gray-200 py-2 mb-4">THÍ SINH {tsId + 1}</h3>
							{#each tsQs as ques, qId}
								<div class="border-b-[1px] border-gray-100 py-2 mb-2">
									<div class="text-sm font-semibold mb-1">Câu {qId + 1}</div>
									<textarea class="textarea textarea-bordered w-full h-16" bind:value={ques.content} placeholder="Nội dung câu hỏi"></textarea>
									<div class="flex gap-2 mt-2">
										<select class="select select-bordered select-sm w-1/3" bind:value={ques.type}>
											<option value="text">Text</option>
											<option value="image">Image</option>
											<option value="audio">Audio</option>
										</select>
										{#if ques.type !== 'text'}
											<input type="file" class="file-input file-input-bordered file-input-sm w-2/3" on:change={(e) => handleFile(e, (f) => ques.file = f)} />
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/each}
				</div>

			{:else if roundMode === 'vcnv'}
				<h2 class="text-xl font-bold mb-4">VƯỢT CHƯỚNG NGẠI VẬT</h2>
				<div class="mb-6 flex gap-4 items-center">
					<span class="font-bold">ĐÁP ÁN CHƯỚNG NGẠI VẬT:</span>
					<input class="input input-bordered w-full max-w-lg font-bold uppercase" type="text" bind:value={vcnvObstacle} placeholder="VD: EL NINO" />
				</div>
				<div class="grid grid-cols-1 gap-4">
					{#each vcnvRows as row, i}
						<div class="border border-gray-300 p-4">
							<h3 class="font-bold">Hàng ngang {i + 1}</h3>
							<div class="grid grid-cols-[1fr_250px] gap-4 mt-2">
								<div class="flex flex-col gap-2">
									<input type="text" class="input input-bordered" bind:value={row.keyword} placeholder="Từ khóa (đáp án)" />
									<textarea class="textarea textarea-bordered" bind:value={row.content} placeholder="Nội dung câu hỏi"></textarea>
								</div>
								<div class="flex flex-col gap-2">
									<input type="number" class="input input-bordered" bind:value={row.char_count} placeholder="Số kí tự" />
									<select class="select select-bordered" bind:value={row.type}>
										<option value="text">Văn bản</option>
										<option value="image">Hình ảnh</option>
										<option value="audio">Âm thanh</option>
									</select>
									{#if row.type !== 'text'}
										<input type="file" class="file-input file-input-bordered file-input-sm w-full" on:change={(e) => handleFile(e, (f) => row.file = f)} />
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
				<div class="mt-8 border-[3px] border-red-200 p-4 bg-red-50">
					<h3 class="font-bold text-red-800">Câu hỏi trung tâm</h3>
					<div class="grid grid-cols-[1fr_250px] gap-4 mt-2">
						<div class="flex flex-col gap-2">
							<input type="text" class="input input-bordered" bind:value={vcnvCenter.answer} placeholder="Từ khóa trung tâm (đáp án)" />
							<textarea class="textarea textarea-bordered" bind:value={vcnvCenter.content} placeholder="Nội dung câu hỏi"></textarea>
						</div>
						<div class="flex flex-col gap-2">
							<select class="select select-bordered" bind:value={vcnvCenter.type}>
								<option value="text">Văn bản</option>
								<option value="image">Hình ảnh (hiển thị CNV)</option>
								<option value="audio">Âm thanh</option>
							</select>
							{#if vcnvCenter.type !== 'text'}
								<input type="file" class="file-input file-input-bordered file-input-sm w-full" on:change={(e) => handleFile(e, (f) => vcnvCenter.file = f)} />
							{/if}
						</div>
					</div>
				</div>

			{:else if roundMode === 'tt'}
				<h2 class="text-xl font-bold mb-4">TĂNG TỐC</h2>
				{#each ttQuestions as ques, i}
					<div class="border-b-2 py-4 mb-2">
						<h3 class="font-bold">Câu {i + 1}</h3>
						<div class="grid grid-cols-[1fr_200px] gap-4 mt-2">
							<textarea class="textarea textarea-bordered w-full" bind:value={ques.content} placeholder="Nội dung câu hỏi"></textarea>
							<div class="flex flex-col gap-2">
								<input type="number" class="input input-bordered" bind:value={ques.time} placeholder="Thời gian (giây)" />
								<!-- TT just needs a file input if needed -->
								<input type="file" class="file-input file-input-bordered file-input-sm w-full" on:change={(e) => handleFile(e, (f) => ques.file = f)} />
							</div>
						</div>
					</div>
				{/each}

			{:else if roundMode === 'vd'}
				<h2 class="text-xl font-bold mb-4">VỀ ĐÍCH</h2>
				<div class="grid grid-cols-2 gap-8">
					{#each vdQuestions as tsQs, tsId}
						<div class="border-[2px] border-gray-200 p-4 rounded-md">
							<h3 class="font-bold text-center bg-gray-200 py-2 mb-4">THÍ SINH {tsId + 1}</h3>
							{#each vdScores as score}
								<div class="mb-4">
									<h4 class="font-bold text-blue-800 border-b border-blue-200 mb-2">CÂU HỎI {score} ĐIỂM</h4>
									{#each tsQs[score] as ques, qId}
										<div class="border-b-[1px] border-gray-100 py-2 mb-2">
											<div class="text-sm font-semibold mb-1">C-{score}-{qId + 1}</div>
											<textarea class="textarea textarea-bordered w-full h-16" bind:value={ques.content} placeholder="Nội dung câu hỏi"></textarea>
											<div class="flex gap-2 mt-2">
												<select class="select select-bordered select-sm w-1/3" bind:value={ques.type}>
													<option value="text">Text</option>
													<option value="image">Image</option>
													<option value="audio">Audio</option>
												</select>
												{#if ques.type !== 'text'}
													<input type="file" class="file-input file-input-bordered file-input-sm w-2/3" on:change={(e) => handleFile(e, (f) => ques.file = f)} />
												{/if}
											</div>
										</div>
									{/each}
								</div>
							{/each}
						</div>
					{/each}
				</div>
			{/if}

			<div class="mt-8 flex justify-end pb-8">
				<button type="submit" class="btn btn-primary btn-lg w-48">LƯU THAY ĐỔI</button>
			</div>
		</form>
	</div>
</AuthCheck>
