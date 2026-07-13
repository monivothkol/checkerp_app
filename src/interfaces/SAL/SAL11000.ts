export interface SAL11000Request {
	searchKeyword?: string;
	quotationStatusCode?: string;
	fromDate?: string;
	toDate?: string;
	pageNo?: number;
	pageSize?: number;
}

export interface SAL11000Item {
	quotationNo: string;
	customerName: string;
	quotationDate: string;
	validUntilDate: string;
	totalAmount: number;
	currencyCode: string;
	quotationStatusCode: string;
	quotationStatusName: string;
}

export interface SAL11000Response {
	status: string;
	message: string;
	data: {
		totalCount: number;
		quotationList: SAL11000Item[];
	};
}
