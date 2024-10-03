import { pb } from './pocketBase';
import { Howl } from 'howler';

export function getCurrentTime() {
	const time = new Date();
	const currentTime =
		(time.getDate() < 10 ? '0' : '') +
		time.getDate() +
		'/' +
		(time.getMonth() + 1 < 10 ? '0' : '') +
		(time.getMonth() + 1) +
		'/' +
		time.getFullYear() +
		'-' +
		(time.getHours() < 10 ? '0' : '') +
		time.getHours() +
		':' +
		(time.getMinutes() < 10 ? '0' : '') +
		time.getMinutes() +
		':' +
		(time.getSeconds() < 10 ? '0' : '') +
		time.getSeconds();
	return currentTime;
}

export function playSound(src: string) {
	const audio = new Howl({
		src: ['src/lib/sound/' + (soundsCollection.get(src) ?? '')],
		volume: 0.5
	});
	audio.play();
}

export async function createLogMessage(message: { from: string; type: string; content: string }) {
	const logMessages = await pb.collection('log').getOne('4t-global-logs0');
	const logs = logMessages.logs;
	const Message = {
		time: getCurrentTime(),
		from: message.from,
		type: message.type,
		content: message.content
	};
	await pb.collection('log').update('4t-global-logs0', { logs: [...logs, Message] });
}

export function download(filename: string, text: string) {
	const element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

export const dictionary = new Map([
	['main', 'Màn hình chính'],
	['kd', 'Khởi động'],
	['tt', 'Tăng tốc'],
	['vcnv', 'VCNV'],
	['vd', 'Về đích'],
	['answers', 'Đáp án thí sinh'],
	['scores', 'Điểm thí sinh'],
	['start', 'Bắt đầu'],
	['rule', 'Luật chơi'],
	['main_vcnv', 'Màn hình VCNV'],
	['main_vd', 'Màn hình chinh Ve Dich'],
	['ques_ts', 'Thi sinh'],
	['ques', 'Bộ câu hỏi'],
	['end', 'Kết thúc'],
	[undefined, 'Chưa có']
]);

export const timerSettings: Map<string, number> = new Map([
	['kd', 10],
	['tt', 30],
	['vcnv', 15],
	['vd_5', 5],
	['vd_10', 10],
	['vd_20', 15],
	['vd_30', 20]
]);

const soundsCollection: Map<string, string> = new Map([
	['tkd', 'main/PointSummary.mp3'],
	['kd_start', 'kd/StartRound.mp3'],
	['kd_start_2', 'kd/StartTurn.mp3'],
	['kd_next', 'kd/PreMainTime.mp3'],
	['kd_1', 'kd/CorrectAnswer.mp3'],
	['kd_0', 'kd/WrongAnswer.mp3'],
	['', ''],
	['tt', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', ''],
	['', '']
]);

export function tooltip(element: HTMLElement) {
	let div: HTMLDivElement;
	let title: string;
	let timeout: number;
	function mouseOver(event: MouseEvent) {
		// NOTE: remove the `title` attribute, to prevent showing the default browser tooltip
		// remember to set it back on `mouseleave`
		title = element.getAttribute('title') ?? 'No title found';
		// element.removeAttribute('title');

		div = document.createElement('div');
		div.textContent = title;
		div.style.cssText = `
			border: 1px solid #ddd;
			box-shadow: 1px 1px 1px #ddd;
			background: white;
			border-radius: 4px;
			padding: 4px;
			position: fixed;
			top: ${event.pageX + 5}px;
			left: ${event.pageY + 5}px;
		`;
		document.body.appendChild(div);
		timeout = setTimeout(() => {
			document.body.removeChild(div);
		}, 3000);
	}
	function mouseMove(event: MouseEvent) {
		div.style.left = `${event.pageX + 5}px`;
		div.style.top = `${event.pageY + 5}px`;
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			document.body.removeChild(div);
		}, 3000);
	}
	function mouseLeave() {
		document.body.removeChild(div);
		// NOTE: restore the `title` attribute
		element.setAttribute('title', title);
	}

	element.addEventListener('mouseover', mouseOver);
	element.addEventListener('mouseleave', mouseLeave);
	element.addEventListener('mousemove', mouseMove);

	return {
		destroy() {
			element.removeEventListener('mouseover', mouseOver);
			element.removeEventListener('mouseleave', mouseLeave);
			element.removeEventListener('mousemove', mouseMove);
		}
	};
}
