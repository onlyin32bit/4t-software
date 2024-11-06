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
		' ' +
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
		volume: 0.1
	});
	audio.play();
}

export async function createLogMessage(from: string, type: string, content: string) {
	const Message = {
		time: getCurrentTime(),
		from: from,
		type: type,
		content: content
	};
	await pb.collection('logs').create(Message);
}

// export async function changeStatus(status) {}

// async function getGlobalSettingsRecord(): Promise<{
// 	season: number;
// 	game: string;
// 	game_number: number;
// }> {
// 	const settingsRecord = await pb.collection('settings').getOne('4t-settings-all');
// 	const field = settingsRecord.field;
// 	return field as { season: number; game: string; game_number: number };
// }

// export function getGlobalSettings():
// 	| { season: number; game: string; game_number: number }
// 	| undefined {
// 	getGlobalSettingsRecord()
// 		.then((value) => {
// 			return value;
// 		})
// 		.catch(() => {});
// 	return undefined;
// }

export async function sendSoundRequest(sound: string) {
	await pb.collection('display_status').update('4T-DISPLAYSTATE', {
		sound: sound
	});
}

export function formatTime2(time: number) {
	return (time / 1000).toFixed(2);
}

export function formatTime3(time: number) {
	return (time / 1000).toFixed(3);
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
	['tk', 'Tứ Kết'],
	['bk', 'Bán Kết'],
	['ck', 'Chung Kết'],
	['main', 'Màn hình chính'],
	['kd', 'Khởi động'],
	['tt', 'Tăng tốc'],
	['vcnv', 'VCNV'],
	['vd', 'Về đích'],
	['answers', 'Đáp án thí sinh'],
	['scores', 'Điểm thí sinh'],
	['extra', 'Bổ sung'],
	['start', 'Bắt đầu'],
	['rule', 'Luật chơi'],
	['intro', 'Mở đầu'],
	['main_kd', 'Màn hình chinh KD'],
	['main_vcnv', 'Màn hình VCNV'],
	['row_vcnv', 'Hang ngang VCNV'],
	['image_vcnv', 'Hinh VCNV'],
	['main_vd', 'Màn hình chinh Ve Dich'],
	['ques', 'Bộ câu hỏi'],
	['ques_chung', 'Cau hoi chung'],
	['ques_extra', 'Cau hoi phu'],
	['ques_ts1', 'Thi sinh 1'],
	['ques_ts2', 'Thi sinh 2'],
	['ques_ts3', 'Thi sinh 3'],
	['ques_ts4', 'Thi sinh 4'],
	['end', 'Kết thúc'],
	[undefined, 'Loading'],
	[null, 'Loading']
]);

export const scoreDistribution: Map<number, Array<number>> = new Map([
	[40, [10, 10, 10, 10]],
	[60, [10, 10, 20, 20]],
	[80, [10, 20, 20, 30]]
]);

//overdated
export const numberOfQues: Map<string, number> = new Map([
	['kd', 12],
	['vcnv', 8],
	['vcnv_bk', 5],
	['tt', 4],
	['vd', 4],
	['vd_bk', 3]
]);

export const timerSettings: Map<string, number> = new Map([
	['kd', 10000],
	['kd_bk', 3000],
	['tt', 30000],
	['vcnv', 15000],
	['vd_5', 5000],
	['vd_10', 10000],
	['vd_15', 15000],
	['vd_20', 20000]
]);

const soundsCollection: Map<string, string> = new Map([
	['tong_ket_diem', 'main/PointSummary.mp3'],
	['space', 'main/Space.mp3'],
	['kd_start', 'kd/StartRound.mp3'],
	['kd_start_2', 'kd/StartTurn.mp3'],
	['kd_start_question', 'kd/PreMainTime.mp3'],
	['kd_correct', 'kd/CorrectAnswer.mp3'],
	['kd_wrong', 'kd/WrongAnswer.mp3'],
	['kd_end', 'kd/FinishTurn.mp3'],
	['vcnv_start', 'vcnv/StartRound.mp3'],
	['vcnv_display', 'vcnv/RowsShow.mp3'],
	['vcnv_select_row', 'vcnv/RowChoose.mp3'],
	['vcnv_time', 'vcnv/15Seconds.mp3'],
	['vcnv_display_row', ''],
	['vcnv_display_picture', 'vcnv/PictureReveal.mp3'],
	['vcnv_end', 'vd/FinishRound.mp3'],
	['bell_vcnv', 'vcnv/ObstacleGrant.mp3'],
	['tt_start', 'tt/StartRound.mp3'],
	['tt_start_question', 'tt/QuestionShowing.mp3'],
	['tt_time', 'tt/???'],
	['tt_end', 'vd/FinishRound.mp3'],
	['vd_start', 'vd/StartRound.mp3'],
	['vd_start_ts', 'vd/StartTurn.mp3'],
	['vd_choose_package', 'vd/ChoiceChosen.mp3'],
	['vd_time_5', 'vd/5Seconds.mp3'],
	['vd_time_15', 'vd/15Seconds.mp3'],
	['vd_time_20', 'vd/20Seconds.mp3'],
	['vd_choose_star', 'vd/StarChoose.mp3'],
	['vd_end', 'vd/FinishRound.mp3'],
	['bell_vd', 'vd/Grant.mp3']
]);
