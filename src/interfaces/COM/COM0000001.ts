export interface COM0000001Request {
	// productCode: string;
}

export interface COM0000001Response {
	totalCount: number;
	list: COM0000001Item[];
}

export interface COM0000001Item {
	productCode: string;
	productName: string;
	productDescription: string;
}

export interface COM0000001DetailResponse {
	productCode: string;
	productName: string;
	productDescription: string;
	productImage: string;
	suitability: string;
	currency: string;
	minOpeningBalance: string;
	ongoingBalance: string;
	interestRate: string;
	entitles: string;
	interestPayment: string;
	dormancyFee: string;
	bookFee: string;
	earlyClosureFee: string;
	resident: number;
	nonResident: number;
}


export interface COM0000001DetailRequest {
	productCode: string;
}
