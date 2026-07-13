export interface COM1000000Request {
	communeCode?: string;
	districtCode?: string;
	provinceCode?: string;
	villageCode?: string;
	enableLoading?: boolean;
	keyword?: string;
	pageNumber: number;
	pageSize: number;
}

export interface COM1000000Response {
	totalCount: number;
	list: COM1000000Item[];
}

export interface COM1000000Item {
	provinceCode: string;
	provinceNameKh: string;
	provinceNameEn: string;
	districtCode: string;
	districtNameKh: string;
	districtNameEn: string;
	communeCode: string;
	communeNameKh: string;
	communeNameEn: string;
	villageCode: string;
	villageNameKh: string;
	villageNameEn: string;
}
