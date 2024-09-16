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
		(time.getHours() / 10 < 1 ? '0' + time.getHours() : time.getHours()) +
		':' +
		(time.getMinutes() / 10 < 1 ? '0' + time.getMinutes() : time.getMinutes()) +
		':' +
		(time.getSeconds() / 10 < 1 ? '0' + time.getSeconds() : time.getSeconds());
	return currentTime;
}

export function playSound(src: string) {
	const audio = new Howl({
		src: ['src/lib/sound/' + (soundsCollection.get(src) ?? '')],
		volume: 0.5
	});
	audio.play();
}

export async function createLogMessage(message: object) {
	const logMessages = await pb.collection('log').getOne('4t-global-logs0');
	const logs = logMessages.logs;
	await pb.collection('log').update('4t-global-logs0', { logs: [...logs, message] });
}

export const dict = new Map([
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
