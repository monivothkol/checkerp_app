/** Stock adjustment create flow — STK31000 (form) → STK32000 (confirm) → STK33000 (detail). */

/** One editable adjustment line on the create form. */
export interface AdjustmentLine {
    productId: string;
    productCode?: string;
    productName: string;
    /** A product with variants is counted per variant — the line is that variant's stock row. */
    variantId?: string;
    variantName?: string;
    current: number;
    counted: number;
}

export interface AdjustmentItemPayload {
    productId: string;
    productName?: string;
    variantId?: string;
    newQuantity: number;
}

export interface STK31000CreatePayload {
    inventoryId?: string;
    reason?: string;
    notes?: string;
    items: AdjustmentItemPayload[];
}

/** Confirm-screen summary line. */
export interface AdjustmentDraftLine {
    name: string;
    code?: string;
    variantName?: string;
    before: number;
    after: number;
}

export interface AdjustmentDraftDisplay {
    inventoryName: string;
    reason: string;
    lines: AdjustmentDraftLine[];
    increases: number;
    decreases: number;
}

/** Draft stashed in ModuleFlowStore between STK31000 → STK32000. */
export interface AdjustmentDraft {
    payload: STK31000CreatePayload;
    display: AdjustmentDraftDisplay;
    idempotencyKey: string;
}

export interface STK31000Response {
    adjustmentCode?: string;
}
