export interface PPM02001I94Request {
	productCode: string;
}

export interface PPM02001I94Response {
	collateralAllowYn: string;
	partialDisbursementAllowYn: string;
	cbcLoanProductGroup: string;
	cbcProductType: string;
	productRepaymentsModeList: PPM02001I94ProductRepaymentsModeList[];
	currencyCode: string;
	loanCommonMasterGroupCode: string;
	rangeStartAmountUSD: number;
	rangeEndAmountUSD: number;
	rangeStartAmountKHR: number;
	rangeEndAmountKHR: number;
	minTermMonth: number;
	maxTermMonth: number;
	minInterestRate: number;
	maxInterestRate: number;
}

export interface PPM02001I94ProductRepaymentsModeList {
	productRepaymentsMode: string;
	productRepaymentsModeDesc: string;
}
