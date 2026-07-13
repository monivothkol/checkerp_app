export interface COM5000000Request {
	domainCode: string;
	levelNo: number;
	upperDomainCodeValue: string;
	enableLoading?: boolean;
	storeOffline?: string;
}

export interface COM5000000Response {
	totalCount: number;
	list: COM5000000Item[];
	group: any;
}

export interface COM5000000Item {
	domainCode: string;
	domainCodeValue: string;
	displayOrder: number;
	languageCode: string;
	codeName: string;
}

