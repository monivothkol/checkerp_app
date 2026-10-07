/** Stock transfer detail — STK23000. */

export interface TransferDetailItem {
    productCode?: string;
    productName?: string;
    quantity?: number;
    unitCost?: number;
}

export interface TransferDetail {
    transferId?: string;
    transferCode?: string;
    fromInventoryName?: string;
    toInventoryName?: string;
    status?: string;
    createdAt?: string;
    notes?: string;
    items?: TransferDetailItem[];
}

export type STK23000Response = TransferDetail;
