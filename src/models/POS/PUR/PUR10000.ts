/** Filter-wide money totals for the list summary row. */
export interface PUR10000ListTotals {
    grandTotal?: number;
}

/** Purchase order (PO) list — PUR10000. */

export interface PurchaseOrderRow {
    poId: string;
    poCode: string;
    supplierName?: string;
    inventoryName?: string;
    orderDate?: string;
    expectedDeliveryDate?: string;
    status: string;
    currency?: string;
    grandTotal: number;
    itemCount?: number;
}

export interface PUR10000Request {
    searchKeyword?: string;
    status?: string;
    supplierId?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface PUR10000Response {
    totals?: PUR10000ListTotals;
    totalCount: number;
    poList: PurchaseOrderRow[];
}
