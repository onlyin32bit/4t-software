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

type DisplayObject = {
	screen: string;
	slide: string;
	question: number;
	numberOfQues: number;
};

export function getScreenStats(e: DisplayObject) {
	return (
		dictionary.get(e.screen) +
		(e.screen === 'answers' || e.screen === 'main' || e.screen === 'scores'
			? ''
			: ' / ' + dictionary.get(e.slide)) +
		(e.screen === 'answers' || e.screen === 'main' || e.screen === 'scores'
			? ''
			: e.slide == 'ques'
				? ' / Câu số ' + e.question + '/' + e.numberOfQues
				: '')
	);
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
	['ques_ts1', 'Thi sinh 1'],
	['ques_ts2', 'Thi sinh 2'],
	['ques_ts3', 'Thi sinh 3'],
	['ques_ts4', 'Thi sinh 4'],
	['ques', 'Bộ câu hỏi'],
	['end', 'Kết thúc'],
	[undefined, 'Chưa có']
]);

export const numberOfQues: Map<string, number> = new Map([
	['kd', 12],
	['vcnv', 8],
	['tt', 4],
	['vd', 4]
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
