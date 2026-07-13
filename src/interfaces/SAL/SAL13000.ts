import { SAL12000ItemList } from "./SAL12000";

export interface SAL13000Request {
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
	itemList: SAL12000ItemList[];
}

export interface SAL13000Response {
	status: string;
	message: string;
	data: {
		quotationNo: string;
	};
}
