/** Filter-wide money totals for the list summary row. */
export interface PUR20000ListTotals {
    grandTotal?: number;
    paidAmount?: number;
}

/** Purchase-in (goods receipt) list — PUR20000. */

export interface PurchaseInRow {
    adjustmentId: string;
    adjustmentCode: string;
    supplierName?: string;
    inventoryName?: string;
    status: string;
    receivedStatus: string;
    grandTotal: number;
    paidAmount: number;
    poCode?: string;
    adjustedAt?: string;
    itemCount?: number;
}

export interface PUR20000Request {
    searchKeyword?: string;
    status?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface PUR20000Response {
    totals?: PUR20000ListTotals;
    totalCount: number;
    purchaseInList: PurchaseInRow[];
}
