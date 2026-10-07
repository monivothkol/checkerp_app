/** Inventory valuation (stock value) report — RPT20000. */
export interface StockValueRow {
    productId: string;
    productCode?: string;
    productName?: string;
    categoryName?: string;
    brandName?: string;
    quantity?: number | string;
    inventoryId?: string;
    inventoryCode?: string;
    inventoryName?: string;
    costPrice?: number | string;
    sellingPrice?: number | string;
    stockValueAtCost?: number | string;
    stockValueAtSelling?: number | string;
    potentialProfit?: number | string;
}

export interface InventoryValuationResponse {
    totalProducts: number;
    totalQuantity?: number | string;
    totalCostValue?: number | string;
    totalStockValue?: number | string;
    totalItems: number;
    items: StockValueRow[];
}
