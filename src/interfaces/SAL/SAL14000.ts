export interface SAL14000Request {
	quotationNo: string;
}

export interface SAL14000Response {
	status: string;
	message: string;
	data: {
		quotationNo: string;
		quotationStatusCode: string;
		quotationStatusName: string;
		issuedDate: string;
	};
}
