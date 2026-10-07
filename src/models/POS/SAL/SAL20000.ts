/** Filter-wide money totals for the list summary row. */
export interface SAL20000ListTotals {
    totalRefund?: number;
}

/** Sale return list — SAL20000. */

export interface ReturnRow {
    returnId: string;
    returnCode?: string;
    saleCode?: string;
    customerName?: string;
    status?: string;
    returnedAt?: string;
    itemCount?: number;
    totalRefund?: number;
}

export interface SAL20000Request {
    searchKeyword?: string;
    status?: string;
    inventoryId?: string;
    createdBy?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    pageNo?: number;
    pageSize?: number;
}

/** Created By filter option — distinct return creator (trimmed user fields). */
export interface ReturnCreator {
    userId: string;
    username?: string;
    email?: string;
    fullName?: string;
}

export interface SAL20000Response {
    totals?: SAL20000ListTotals;
    totalCount: number;
    returnList: ReturnRow[];
    creators?: ReturnCreator[];
}
