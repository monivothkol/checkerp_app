export interface COM4000000Request {
	domainCode: string;
	pageNumber?: number;
	pageSize?: number;
	enableLoading?: boolean;
}

export interface COM4000000Response {
	totalCount: number;
	list: COM4000000Item[];
	group: any;
}

export interface COM4000000Item {
	domainCode: string;
	domainCodeValue: string;
	displayOrder: number;
	languageCode: string;
	codeName: string;
}
