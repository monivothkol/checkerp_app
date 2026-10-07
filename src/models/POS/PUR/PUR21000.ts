/** Purchase-in create flow — PUR21000 (form) → PUR22000 (confirm) → PUR23000. */

/** One editable line on the create form. */
export interface PurchaseInLine {
    productId: string;
    productCode: string;
    productName: string;
    /** A product with variants is received per variant — its stock lands on that variant's row. */
    variantId?: string;
    variantName?: string;
    quantity: number;
    unitCost: number;
    discountAmount: number;
    taxRate: number;
    taxRecoverable: boolean;
    expiryDate?: string;   // batch expiry (perishables); enables/keeps batch tracking
}

/** Client-derived PO dropdown option (from PUR10000 poList). */
export interface PoOption {
    poId: string;
    label: string;
}

export interface PurchaseInItemPayload {
    productId: string;
    quantity: number;
    unitCost: number;
    discountAmount: number;
    taxRate: number;
    taxRecoverable: boolean;
}

export interface PUR21000CreatePayload {
    supplierId?: string;
    inventoryId?: string;
    purchaseOrderId?: string;
    supplierInvoiceId?: string;
    notes?: string;
    itemList: PurchaseInItemPayload[];
}

/** Confirm-screen summary line. */
export interface PurchaseInDraftLine {
    name: string;
    code: string;
    variantName?: string;
    qty: number;
    cost: number;
    discount: number;
    taxRate: number;
    tax: number;
    recoverable: boolean;
    amount: number;
}

export interface PurchaseInDraftDisplay {
    supplierName: string;
    inventoryName: string;
    poLabel: string;
    supplierInvoiceId: string;
    lines: PurchaseInDraftLine[];
    subTotal: number;
    discountTotal: number;
    taxTotal: number;
    grandTotal: number;
}

export interface PurchaseInDraft {
    payload: PUR21000CreatePayload;
    idempotencyKey: string;
    display: PurchaseInDraftDisplay;
}

export interface PUR21000CreateResponse {
    adjustmentId?: string;
    adjustmentCode?: string;
    grandTotal?: number;
}

/** Result stashed for the PUR23000 success screen. */
export interface PurchaseInResult {
    adjustmentId?: string;
    adjustmentCode?: string;
    grandTotal?: number;
    supplierName: string;
}
