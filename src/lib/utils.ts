import { pb } from './pocketBase';

export function getCurrentTime() {
	const time = new Date();
	const currentTime =
		time.getDate() +
		'/' +
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

export async function createLogMessage(message: object) {
	const logMessages = await pb.collection('log').getOne('4t-global-logs0');
	const logs = logMessages.logs;
	await pb.collection('log').update('4t-global-logs0', { logs: [...logs, message] });
}

export const dict = new Map([
	['main', 'Màn hình chính'],
	['kd', 'Khởi động'],
	['tt', 'Tăng tốc'],
	['vcnv', 'Vượt chướng ngại vật'],
	['vd', 'Về đích'],
	['answers', 'Đáp án thí sinh'],
	['scores', 'Điểm thí sinh'],
	['start', 'Bắt đầu'],
	['rule', 'Luật chơi'],
	['main_vcnv', 'Màn hình VCNV'],
	['ques', 'Bộ câu hỏi'],
	['end', 'Kết thúc']
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
