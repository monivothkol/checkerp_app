export interface LSB01001I20Request {
	collateralList: any[];
	customerNo: string;
	downPaymentPercentage: number;
	dscrRatio: number;
	loanApprovalApplicationNo: string;
	loanCommonMasterGroupCode: string;
	ltvRatio: number;
	totalCoBorrowers: number;
}

export interface LSB01001I20Response {
	configCrrList: LSB01001I20ConfigCrrList[];
	configResultMapList: LSB01001I20ConfigResultMapList[];
}

export interface LSB01001I20ConfigCrrList {
	loanCommonMasterGroupCode: string;
	loanCommonCode: string;
	loanCommonClassificationCode: string;
	loanCommonClassificationName: string;
	contents: string;
	evaluateGrade: number;
	selectYn: boolean;
}

export interface LSB01001I20ConfigResultMapList {
	loanCommonMasterGroupCode: string;
	scoreGrade: string;
	scorePercentageStart: number;
	scorePercentageEnd: number;
	riskLevelCode: string;
	riskLevelName: string;
}
