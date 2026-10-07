/** Filter-wide money totals for the list summary row. */
export interface SAL11000ListTotals {
    totalAmount?: number;
}

/** Quotation list — SAL11000. */

export interface QuotationRow {
    quotationNo: string;
    customerName?: string;
    quotationDate?: string;
    totalAmount?: number;
    status?: string;
}

export interface SAL11000Request {
    pageNo?: number;
    pageSize?: number;
    searchKeyword?: string;
    quotationStatusCode?: string;
    fromDate?: string;
    toDate?: string;
}

export interface SAL11000Response {
    totals?: SAL11000ListTotals;
    totalCount: number;
    quotationList: QuotationRow[];
}
