/** Stock adjustment list — STK30000. */

export interface AdjustmentRow {
    adjustmentCode: string;
    inventoryName?: string;
    reason?: string;
    itemCount?: number;
    status?: string;
    createdAt?: string;
}

export interface STK30000Request {
    searchKeyword?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface STK30000Response {
    totalCount: number;
    adjustmentList: AdjustmentRow[];
}
