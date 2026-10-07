/** Stock detail (per-inventory breakdown) — STK13000. */

export interface StockDetailInventory {
    /** Units committed to a pending stock transfer — on the shelf but not sellable. */
    onHoldStock?: number;
    /** Set when the product has variants — one stock row exists per variant. */
    variantName?: string;
    inventoryName?: string;
    quantity?: number;
    availableQuantity?: number;
    averageCost?: number;
    totalCostValue?: number;
}

export interface StockDetail {
    productName?: string;
    unitName?: string;
    inventories?: StockDetailInventory[];
}

export type STK13000Response = StockDetail;
