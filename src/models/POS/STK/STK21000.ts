/** Stock transfer create flow — STK21000 (form) → STK22000 (confirm) → STK23000 (detail). */

/** One editable transfer line on the create form. */
export interface TransferLine {
    productId: string;
    productCode?: string;
    productName: string;
    /** A product with variants moves per variant — the line is that variant's stock row. */
    variantId?: string;
    variantName?: string;
    available: number;
    quantity: number;
}

export interface TransferItemPayload {
    productId: string;
    productName?: string;
    variantId?: string;
    quantity: number;
}

export interface STK21000CreatePayload {
    fromInventoryId?: string;
    toInventoryId?: string;
    notes?: string;
    items: TransferItemPayload[];
}

/** Confirm-screen summary line. */
export interface TransferDraftLine {
    name: string;
    code?: string;
    variantName?: string;
    qty: number;
}

export interface TransferDraftDisplay {
    fromName: string;
    toName: string;
    lines: TransferDraftLine[];
    totalQty: number;
}

/** Draft stashed in ModuleFlowStore between STK21000 → STK22000. */
export interface TransferDraft {
    payload: STK21000CreatePayload;
    display: TransferDraftDisplay;
    idempotencyKey: string;
}

export interface STK21000Response {
    transferCode?: string;
}
