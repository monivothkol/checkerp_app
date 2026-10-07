/** Stock movement history — STK40000. */

export interface HistoryRow {
    movementDate?: string;
    movementType?: string;
    referenceCode?: string;
    productName?: string;
    productCode?: string;
    inventoryName?: string;
    quantityChange?: number;
}

/** Table row with the synthetic dedup key added on the client. */
export interface HistoryListRow extends HistoryRow {
    rowKey: string;
}

export interface STK40000Request {
    searchKeyword?: string;
    inventoryId?: string;
    movementType?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface STK40000Response {
    totalCount: number;
    historyList: HistoryRow[];
}
