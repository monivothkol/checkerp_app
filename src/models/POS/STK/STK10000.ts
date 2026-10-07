/** Stock list — STK10000. A stock row also feeds the transfer/adjustment product pickers. */

export interface StockRow {
    productId?: string;
    productCode?: string;
    productName?: string;
    productActive?: boolean;
    inventoryName?: string;
    quantity?: number;
    availableQuantity?: number;
    /** Units committed to a pending stock transfer — on the shelf but not sellable. */
    onHoldStock?: number;
    /** Set when the product has variants — one stock row exists per variant. */
    variantId?: string;
    variantName?: string;
    averageCost?: number;
}

/** Table row with the synthetic dedup key added on the client. */
export interface StockListRow extends StockRow {
    rowKey: string;
}

export interface STK10000Request {
    searchKeyword?: string;
    inventoryId?: string;
    pageNo?: number;
    pageSize?: number;
    isActive?: boolean;
}

export interface STK10000Response {
    totalCount: number;
    stockList: StockRow[];
}
