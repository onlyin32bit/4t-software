<script lang="ts">
	import { fade, slide, scale, fly } from 'svelte/transition';
	import { typewriter } from '$lib/transitions';

	export let screen: string;

	const rule: Map<string, { fullname: string; content: string; fontSize: number }> = new Map([
		[
			'kd',
			{
				fullname: 'KHỞI ĐỘNG',
				content: `	Phần thi được chia thành 2 lượt: lượt riêng và lượt chung.
	Trong lượt riêng, mỗi thí sinh trả lời 10 câu hỏi. Thời gian trả lời cho mỗi câu hỏi là 3 giây từ lúc MC đọc xong câu hỏi. Mỗi câu trả lời đúng được 10 điểm, trả lời sai không bị trừ điểm.
	Trong lượt chung, các thí sinh trả lời 12 câu hỏi trong thời gian không giới hạn. Thí sinh giành quyền trả lời bằng cách bấm chuông. Thí sinh có tối đa 3 giây tính từ lúc giành được quyền trả lời để đưa ra đáp án. Mỗi câu trả lời đúng được 10 điểm, trả lời sai hoặc bấm chuông mà không có câu trả lời trong 3 giây sẽ bị trừ 5 điểm. Sau 3 giây tính từ thời điểm MC đọc xong câu hỏi, nếu không có thí sinh nào giành quyền trả lời, câu hỏi đó sẽ bị bỏ qua.`,
				fontSize: 4.12
			}
		],
		[
			'tt',
			{
				fullname: 'TĂNG TỐC',
				content: `    	Trong vòng 30 giây, các thí sinh cùng trả lời bằng máy tính:
• Thí sinh trả lời đúng và nhanh nhất được 40 điểm.
• Thí sinh trả lời đúng và nhanh thứ 2 được 30 điểm.
• Thí sinh trả lời đúng và nhanh thứ 3 được 20 điểm.
• Thí sinh trả lời đúng và nhanh thứ 4 được 10 điểm.
		Phần thi sẽ có 4 câu hỏi:
• 1 câu hỏi IQ-Logic bao gồm các dạng: Tìm số thích hợp điền vào chỗ trống, tìm hình khác nhất, tìm hình còn thiếu, giải mật mã,…
• 2 câu hỏi dữ kiện: các dữ kiện sẽ lần lượt xuất hiện với độ khó giảm dần. Dựa vào đó, thí sinh sẽ trả lời các câu hỏi như: Đây là ai? Đây là địa danh nào? Đây là gì?...
• 1 câu hỏi sắp xếp bao gồm ghép nối các dữ kiện theo từng cặp hoặc sắp xếp theo một thứ tự nhất định.`,
				fontSize: 3.6
			}
		],
		[
			'vcnv',
			{
				fullname: 'VƯỢT CHƯỚNG NGẠI VẬT',
				content: `  Có 4 từ hàng ngang - cũng chính là 4 gợi ý liên quan đến Chướng ngại vật mà các thí sinh phải đi tìm. Có 1 gợi ý thứ 5 - là 1 hình ảnh liên quan đến CNV hoặc chính là CNV. Hình ảnh được chia thành 5 ô đánh số thứ tự từ 1 đến 4 và một ô trung tâm.
    Mỗi thí sinh có tối đa 1 lượt lựa chọn để chọn trả lời một trong các từ hàng ngang này. Cả 4 thí sinh trả lời câu hỏi bằng máy tính trong thời gian suy nghĩ 15 giây. Trả lời đúng mỗi từ hàng ngang, thí sinh được 10 điểm. Ngoài việc mở được từ hàng ngang nếu trả lời đúng, 1 góc của hình ảnh (được đánh số tương ứng với số từ hàng ngang) cũng được mở ra.
	Thí sinh có thể bấm chuông trả lời CNV bất cứ lúc nào:
		•  Trả lời đúng CNV trong 1 từ hàng ngang đầu tiên  được 60 điểm.
		•  Trả lời đúng CNV trong 2 từ hàng ngang được 50 điểm.
		•  Trả lời đúng CNV trong 3 từ hàng ngang được 40 điểm.
		•  Trả lời đúng CNV trong 4 từ hàng ngang được 30 điểm.
		•  Trả lời đúng CNV ở câu hỏi gắn với ô trung tâm được 20 điểm.
	Nếu trả lời sai CNV thí sinh sẽ bị loại khỏi phần chơi này.`,
				fontSize: 3.2
			}
		],
		[
			'vd',
			{
				fullname: 'VỀ ĐÍCH',
				content: `  Có các câu hỏi ở 2 mức điểm là 20 và 30 điểm với thời gian trả lời tương ứng là 15 và 20 giây. Trước khi bắt đầu phần thi, thí sinh lựa chọn 3 câu hỏi tùy ý cho mình. Thứ tự tham gia được xác định theo kết quả sau phần thi Tăng tốc và sau lượt thi Về đích của mỗi thí sinh. Nếu các thí sinh có cùng số điểm thì người có số thứ tự đứng nhỏ hơn sẽ là người dự thi trước.
    Thí sinh đang trả lời gói câu hỏi của mình phải đưa ra câu trả lời trong thời gian quy định. Nếu thí sinh trả lời đúng sẽ ghi được điểm của câu hỏi. Nếu không trả lời được câu hỏi thì các thí sinh còn lại có 5 giây để bấm chuông trả lời. Chỉ một người nhấn chuông nhanh nhất được quyền trả lời, trả lời đúng được cộng thêm số điểm của câu hỏi từ thí sinh đang thi. Trả lời sai bị trừ đi một nửa số điểm của câu hỏi.
    Thí sinh có quyền được đặt ngôi sao hy vọng 1 lần trước bất kỳ câu hỏi nào. Trả lời đúng được gấp đôi số điểm, trả lời sai bị trừ đi số điểm bằng số điểm của câu hỏi đặt NSHV.`,
				fontSize: 3.4
			}
		]
	]);
</script>

<div
	class="fixed h-screen w-screen bg-bg-rule bg-contain bg-center bg-no-repeat"
	in:slide={{ duration: 2000 }}
	out:scale={{ duration: 1000 }}
>
	<h1
		class="fixed left-0 top-0 z-50 w-screen text-center font-header-text text-[8vh] text-yellow-300"
		in:typewriter={{ delay: 1000, speed: 1 }}
		out:scale={{ duration: 1000 }}
	>
		{`${rule.get(screen)?.fullname}`}
	</h1>
	<div
		class="fixed left-1/2 top-[17vh] z-50 w-[72.5vw] -translate-x-1/2 text-left font-futuristic text-white"
		style={`font-size: ${rule.get(screen)?.fontSize}vh;`}
	>
		<p
			class="whitespace-pre-wrap"
			in:typewriter={{ delay: 2100, speed: 2.5 }}
			out:scale={{ duration: 1000 }}
		>
			{rule.get(screen)?.content}
		</p>
	</div>
</div>
