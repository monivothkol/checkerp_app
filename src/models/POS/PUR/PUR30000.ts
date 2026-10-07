/** PUR30000 purchase return — drafts over stock_adjustments (type PURCHASE_RETURN). */

export interface PurchaseReturnRow {
    adjustmentId: string;
    adjustmentCode?: string;
    supplierName?: string;
    inventoryName?: string;
    status?: string;
    grandTotal?: number;
    itemCount?: number;
    adjustedAt?: string;
}

export interface PUR30000Response {
    totalCount?: number;
    purchaseReturnList?: PurchaseReturnRow[];
    totals?: { grandTotal?: number };
}

export interface PurchaseReturnItem {
    lineNo?: number;
    productCode?: string;
    productName?: string;
    quantityDifference?: number;
    unitCost?: number;
    lineTotal?: number;
    notes?: string;
}

export interface PurchaseReturnDetail extends PurchaseReturnRow {
    /** Refund received from the supplier (defaults to the document's full value). */
    paidAmount?: number;
    inventoryId?: string;
    notes?: string;
    items?: PurchaseReturnItem[];
}

/** PUR30000I02 create payload line (same shape the purchase-in create takes). */
export interface PurchaseReturnCreateItem {
    productId: string;
    quantity: number;
    /** Cost basis of the returned goods — must be > 0 (WAC guard). */
    unitCost?: number;
}

export interface PurchaseReturnCreateResponse {
    adjustmentId: string;
    adjustmentCode: string;
    grandTotal?: number;
}

/** PUR30000I04/I05 result. */
export interface PurchaseReturnDecisionResponse {
    adjustmentId: string;
    status: string;
}
