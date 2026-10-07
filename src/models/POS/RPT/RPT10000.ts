/** Stock aging report — RPT10000. */
export interface StockAgingRow {
    productId: string;
    productCode?: string;
    productName?: string;
    categoryName?: string;
    brandName?: string;
    variantId?: string;
    inventoryId?: string;
    inventoryName?: string;
    quantity?: number | string;
    averageCost?: number | string;
    totalValue?: number | string;
    firstReceivedDate?: string;
    daysInStock?: number;
    ageBucket?: string;
}

export interface StockAgingReportResponse {
    totalItems: number;
    totalValue?: number | string;
    value0To30Days?: number | string;
    value31To60Days?: number | string;
    value61To90Days?: number | string;
    value90PlusDays?: number | string;
    items: StockAgingRow[];
}
