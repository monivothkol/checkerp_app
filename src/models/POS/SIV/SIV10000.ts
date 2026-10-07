/** Invoice (sale) list — SIV10000. */

export interface SaleRow {
    saleId: string;
    customerId?: string;
    customerPhone?: string;
    saleCode: string;
    saleDate: string;
    customerName?: string;
    salePersonName?: string;
    inventoryName?: string;
    sellType?: string;
    subtotal?: number;
    discountAmount?: number;
    totalAmount: number;
    /** Only present when the caller holds INVOICE:VIEW_PURCHASE_COST. */
    totalCost?: number;
    paidAmount: number;
    creditAppliedAmount?: number;
    status?: string;
    paymentStatus: string;
    createdByName?: string;
    createdAt?: string;
}

export interface SIV10000Request {
    searchKeyword?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    inventoryId?: string;
    salePersonId?: string;
    sellType?: string;
    customerType?: string;
    createdBy?: string;
    hasDiscount?: boolean;
    customerId?: string;
    unpaidOnly?: boolean;
    pageNo?: number;
    pageSize?: number;
}

/** Filter-wide money totals for the list's summary row. */
export interface SaleListTotals {
    subtotal?: number;
    discountAmount?: number;
    totalAmount?: number;
    totalCost?: number;
}

export interface SIV10000Response {
    totalCount: number;
    /** Whether the caller may see cost columns (drives the Total Cost column). */
    costVisible?: boolean;
    totals?: SaleListTotals;
    saleList: SaleRow[];
}
