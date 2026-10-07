/** Sale return create flow — SAL21000 (form) → SAL22000 (confirm) → SAL23000 (result). */

/** SAL25000 — sale lookup used to seed the returnable lines. */
export interface SaleReturnLookupItem {
    saleItemId: string;
    productCode?: string;
    productName: string;
    quantitySold: number;
    alreadyReturned: number;
    returnableQuantity: number;
    unitPrice: number;
    suggestedRefund: number;
}

export interface SaleReturnLookup {
    saleId: string;
    saleCode: string;
    inventoryId?: string;
    customerName?: string;
    items?: SaleReturnLookupItem[];
}

export interface SAL25000Request {
    saleCode: string;
}

/** One editable return line on the create form. */
export interface ReturnLine {
    saleItemId: string;
    productCode?: string;
    productName: string;
    quantitySold: number;
    alreadyReturned: number;
    returnableQuantity: number;
    unitPrice: number;
    suggestedRefund: number;
    returnQty: number;
    /** Actual refund to give the customer for this line — defaults to the full
     *  cap (suggestedRefund × returnQty/sold), editable down for partial refunds. */
    refundAmount: number;
}

export interface ReturnItemPayload {
    saleItemId: string;
    quantityReturned: number;
    /** Actual refund for this line; omit/undefined = full (backend caps at retail). */
    refundAmount?: number;
}

export interface SAL21000CreatePayload {
    saleId: string;
    inventoryId?: string;
    notes?: string;
    itemList: ReturnItemPayload[];
}

/** Confirm-screen summary line. */
export interface ReturnDraftLine {
    name: string;
    code?: string;
    qty: number;
    refund: number;
}

export interface ReturnDraftDisplay {
    saleCode: string;
    customerName?: string;
    lines: ReturnDraftLine[];
    totalRefund: number;
}

/** Draft stashed in ModuleFlowStore between SAL21000 → SAL22000 → SAL23000. */
export interface ReturnDraft {
    payload: SAL21000CreatePayload;
    display: ReturnDraftDisplay;
    idempotencyKey: string;
}

export interface SAL21000Response {
    returnId?: string;
    returnCode?: string;
    totalRefund?: number;
}

/** Result stashed for the SAL23000 success screen. */
export interface ReturnResult {
    returnId?: string;
    returnCode?: string;
    totalRefund?: number;
    saleCode: string;
}
