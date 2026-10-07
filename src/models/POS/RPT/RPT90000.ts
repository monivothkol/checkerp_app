/** Purchase report — RPT90000. */
export interface PurchaseReportRow {
    adjustmentId: string;
    adjustmentCode?: string;
    invoiceNumber?: string;
    purchaseDate?: string;
    totalAmount?: number | string;
    paidAmount?: number | string;
    outstandingAmount?: number | string;
    paymentStatus?: string;
    supplierId?: string;
    supplierName?: string;
    inventoryId?: string;
    inventoryName?: string;
    itemCount?: number;
    status?: string;
    receivedStatus?: string;
    createdByName?: string;
}

export interface PurchaseReportResponse {
    totalPurchase?: number | string;
    totalPaid?: number | string;
    totalUnpaid?: number | string;
    purchaseCount?: number;
    averageOrderValue?: number | string;
    orderedAmount?: number | string;
    totalElements: number;
    items: PurchaseReportRow[];
}
