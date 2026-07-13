export interface COM110000Request {
	accountNo?: string;
	accountName?: string;
	customerNo?: string;
	pageNumber?: number;
	pageSize?: number;
	type?: string;
}

export interface COM110000Response {
	totalCount: number;
	list: COM110000Item[];

}

export interface COM110000Item {
	accountNo: string;
	transactionChannelTypeCode: string;
	accountMgmtBranchCode: string;
	productCode: string;
	customerNo: string;
	depositAccountStatusCode: string;
	applyInterestRate: number;
	accountBalance: number;
	currentWithdrawableAccruedInterestAmount: number;
	newDate: string;
	lastTransactionDate: string;
	newTellerID: string;
	loanLinkYN: string;
	newTime: string;
	currencyCode: string;
	availableBalance: number;
	freezeAmount: number;
	accountDivideCode: string;
	applyTaxRate: number;
	depositSubjectCode: string;
	accountName: string;
	productName: string;
}
