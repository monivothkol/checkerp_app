export interface DAS10000Request {
}

export interface DAS10000DailyProfit {
	label: string;
	saleDate: string;
	profit: number;
	revenue: number;
}

export interface DAS10000TopProduct {
	productName: string;
	quantity: number;
	amount: number;
}

export interface DAS10000Response {
	todayRevenue: number;
	thisWeekRevenue: number;
	thisMonthRevenue: number;
	todayActualPayment: number;
	dailySaleProfit: DAS10000DailyProfit[];
	topProducts: DAS10000TopProduct[];
}
