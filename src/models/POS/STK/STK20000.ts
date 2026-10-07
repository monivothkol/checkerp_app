/** Stock transfer list — STK20000. */

export interface TransferRow {
    transferCode: string;
    fromInventoryName?: string;
    toInventoryName?: string;
    itemCount?: number;
    status?: string;
    createdAt?: string;
}

export interface STK20000Request {
    searchKeyword?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface STK20000Response {
    totalCount: number;
    transferList: TransferRow[];
}
