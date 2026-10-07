/** Stock adjustment detail — STK33000. */

export interface AdjustmentDetailItem {
    productCode?: string;
    productName?: string;
    quantityBefore?: number;
    quantityAfter?: number;
    quantityDifference?: number;
}

export interface AdjustmentDetail {
    inventoryName?: string;
    status?: string;
    reason?: string;
    createdAt?: string;
    notes?: string;
    items?: AdjustmentDetailItem[];
}

export type STK33000Response = AdjustmentDetail;
