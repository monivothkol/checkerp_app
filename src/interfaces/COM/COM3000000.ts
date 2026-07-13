export interface COM3000000Request {
	productCode: string;
	productName: string;
	productDetailCode: string;
	productBusinessTypeCode: string; //LN = loan product, DP = deposit product
	productApplyStatusCode: string; //10
	pageSize: number;
	pageNumber: number;
	enableLoading?: boolean;
}
export interface COM3000000Response {
	totalCount: number;
	list: COM3000000Item[];
}

export interface COM3000000Item {
	managementSeqNo: number;
	productApplyStatusCode: string;
	productBusinessTypeCode: string;
	productCode: string;
	productDetailCode: string;
	productTypeCode: string;
	productCurrencyCode: string;
	refProductCode: string;
	productLocalName: string;
	productName: string;
	productSaleStatusCode: string;
	productShortName: string;
	saleEndDate: string;
	saleStartDate: string;
}
