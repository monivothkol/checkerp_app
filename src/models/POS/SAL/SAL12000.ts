/** Quotation create flow — SAL12000 (form) → SAL13000 (confirm) → SAL14000 (result). */

/** One editable line on the create form. */
export interface QuotationLine {
    itemCode: string;
    itemName: string;
    /** A product with variants is quoted per variant, so the invoice made from it keeps it. */
    variantId?: string;
    variantName?: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
}

export interface QuotationItemPayload {
    itemCode: string;
    itemName: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
}

export interface SAL12000CreatePayload {
    customerName: string;
    customerPhone?: string;
    quotationDate: string;
    remark?: string;
    inventoryId?: string;
    itemList: QuotationItemPayload[];
}

/** Confirm-screen summary line. */
export interface QuotationDraftLine {
    name: string;
    code: string;
    qty: number;
    price: number;
    discount: number;
    amount: number;
}

export interface QuotationDraftDisplay {
    customer: string;
    phone: string;
    date: string;
    lines: QuotationDraftLine[];
    subTotal: number;
    discountTotal: number;
    totalAmount: number;
}

/** Draft stashed in ModuleFlowStore between SAL12000 → SAL13000 → SAL14000. */
export interface QuotationDraft {
    payload: SAL12000CreatePayload;
    display: QuotationDraftDisplay;
    idempotencyKey: string;
}

export interface SAL12000Response {
    quotationNo?: string;
}

/** Result stashed for the SAL14000 success screen. */
export interface QuotationResult {
    quotationNo?: string;
    customerName: string;
}
