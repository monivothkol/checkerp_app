export interface LOG1200000Request {}

export interface LOG1200000Response {
	policyId: string;
	minLength: number;
	maxLength: number;
	requireUppercase: string;
	requireLowercase: string;
	requireNumber: string;
	requireSpecialChar: string;
	disallowSequential: string;
	disallowRepeat: string;
	sequentialLengthThreshold: number;
	repeatThreshold: number;
	createDepart: string;
	createBy: string;
	createDate: string;
	createTime: string;
	updateDepart: string;
	updateBy: string;
	updateDate: string;
	updateTime: string;
	multilingualContent: multilingualContent[];
}

export interface multilingualContent {
	languageCode: string;
	messageRule: string;
}
