export interface USC01001I02Request {
	pageNumber: number;
	pageSize: number;
	standardIndustryCategoryCode: string;
	standardIndustryCategoryName: string;
}

export interface USC01001I02Response {
	totalCount: number;
	list: USC01001I02Item[];
}

export interface USC01001I02Item {
	standardIndustryCategoryCode: string;
	standardIndustryCategoryName: string;
}
