export type DisplayObject = {
	screen: string;
	slide: string;
	question: number;
	numberOfQuestion: number;
};

export type QuestionObject = {
	content: string;
	type: 'text' | 'audio' | 'image';
};

export type VCNVQuestionObject = { keyword: string } & QuestionObject;
