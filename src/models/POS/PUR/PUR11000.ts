/** PO create flow — PUR11000 (form) → PUR12000 (confirm) → PUR13000 (result). */

/** One editable line on the create form. */
export interface PoLine {
    productId: string;
    productCode: string;
    productName: string;
    /** A product with variants is ordered per variant. */
    variantId?: string;
    variantName?: string;
    orderedQuantity: number;
    unitCost: number;
    discountAmount: number;
    taxRate: number;
}

export interface PoItemPayload {
    productId: string;
    orderedQuantity: number;
    unitCost: number;
    discountAmount: number;
    taxRate: number;
}

export interface PUR11000CreatePayload {
    supplierId?: string;
    inventoryId?: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    paymentTerm?: string;
    remark?: string;
    itemList: PoItemPayload[];
}

/** Confirm-screen summary line. */
export interface PoDraftLine {
    name: string;
    code: string;
    variantName?: string;
    qty: number;
    cost: number;
    discount: number;
    taxRate: number;
    tax: number;
    amount: number;
}

export interface PoDraftDisplay {
    supplierName: string;
    inventoryName: string;
    orderDate: string;
    expectedDeliveryDate: string;
    paymentTerm: string;
    lines: PoDraftLine[];
    subTotal: number;
    discountTotal: number;
    taxTotal: number;
    grandTotal: number;
}

export interface PoDraft {
    payload: PUR11000CreatePayload;
    idempotencyKey: string;
    display: PoDraftDisplay;
}

export interface PUR11000CreateResponse {
    poId?: string;
    poCode?: string;
    grandTotal?: number;
}

/** Result stashed for the PUR13000 success screen. */
export interface PoResult {
    poId?: string;
    poCode?: string;
    grandTotal?: number;
    supplierName: string;
}
