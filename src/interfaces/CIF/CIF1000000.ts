export interface CIF1000000Request {
	keyword?: string;
	searchType?: string;
	customerNo?: string;
	customerName?: string;
	phoneNumber?: string;
	customerType?: string;
	gender?: string;
	identifyNumber?: string;
	idType?: string;
	startDate?: string;
	endDate?: string;
	pageNumber: number;
	pageSize: number;
	enableLoading?: boolean;
}

export interface CIF1000000Response {
	list: CIF1000000Item[];
	totalCount: number;
}

export interface CIF1000000Item {
	consultationCount: string;
	customerNo: string;
	customerName: string;
	gender: string;
	customerType: string;
	identifyType: string;
	identifyNumber: string;
	birthDate: string;
	phoneNumber: string;
	occupationDescription: string;
	addressDetail: string;
	createdDate: string;
}
