/** Product profitability rows — shared by RPT40000 (COGS) and RPT50000 (P&L). */
export interface ProductProfitRow {
    productId: string;
    productCode?: string;
    productName?: string;
    categoryId?: string;
    categoryName?: string;
    brandId?: string;
    brandName?: string;
    totalQuantitySold?: number | string;
    totalRevenue?: number | string;
    totalCost?: number | string;
    totalGrossProfit?: number | string;
    totalTransactions?: number;
    averageCost?: number | string;
    averageSellingPrice?: number | string;
    profitMarginPercentage?: number | string;
}

export interface ProductProfitResponse {
    products: ProductProfitRow[];
}
