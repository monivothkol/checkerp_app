export interface PRD10000Request {
	searchKeyword?: string;
	isActive?: boolean;
	pageNo?: number;
	pageSize?: number;
}

export interface PRD10000Item {
	productId: string;
	productCode: string;
	productName: string;
	barcode?: string;
	sellingPrice?: number;
	minSellingPrice?: number;
	costPrice?: number;
	unitOfMeasure?: string;
	categoryName?: string;
	imageUrl?: string;
	isActive?: boolean;
}

export interface PRD10000Response {
	totalCount: number;
	productList: PRD10000Item[];
}
