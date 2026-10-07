/** Supplier analysis report — RPT91000. */
export interface SupplierAnalysisRow {
    supplierId: string;
    supplierCode?: string;
    supplierName?: string;
    supplierPhone?: string;
    totalPurchase?: number | string;
    orderCount?: number;
    averageOrder?: number | string;
    paidAmount?: number | string;
    outstanding?: number | string;
    lastPurchaseDate?: string;
    avgDeliveryDays?: number;
}

export interface SupplierAnalysisResponse {
    suppliersUsed: number;
    topSupplierSpend?: number | string;
    totalOutstanding?: number | string;
    averageDeliveryDays?: number;
    totalElements: number;
    suppliers: SupplierAnalysisRow[];
}
