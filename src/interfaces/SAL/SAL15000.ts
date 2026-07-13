import { SAL12000ItemList } from "./SAL12000";

export interface SAL15000Request {
	quotationNo: string;
}

export interface SAL15000Detail {
	quotationNo: string;
	customerNo?: string;
	customerName: string;
	phoneNo?: string;
	address?: string;
	quotationDate: string;
	validUntilDate?: string;
	currencyCode: string;
	remark?: string;
	subTotalAmount: number;
	discountAmount: number;
	totalAmount: number;
	quotationStatusCode: string;
	quotationStatusName: string;
	itemList: SAL12000ItemList[];
}

export interface SAL15000Response {
	status: string;
	message: string;
	data: SAL15000Detail;
}
