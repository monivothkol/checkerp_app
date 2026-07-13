export interface SAL12000Request {
	customerNo?: string;
	customerName: string;
	phoneNo?: string;
	address?: string;
	quotationDate: string;
	validUntilDate?: string;
	currencyCode: string;
	remark?: string;
	itemList: SAL12000ItemList[];
}

export interface SAL12000ItemList {
	itemCode: string;
	itemName: string;
	quantity: number;
	unitPrice: number;
	discountAmount?: number;
	amount: number;
}

export interface SAL12000Response {
	status: string;
	message: string;
	data: Record<string, any>;
}
