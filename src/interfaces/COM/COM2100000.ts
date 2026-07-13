export interface COM2100000Request {
	standardCodeDesc?: string;
	standardCodeValue?: string;
	enableLoading?: boolean;
	pageNumber: number;
	pageSize: number;
}

export interface COM2100000Response {
	totalCount: number;
	list: COM2100000Item[];
}

export interface COM2100000Item {
	standardCodeValue: string;
	standardCodeDesc: string;
}
