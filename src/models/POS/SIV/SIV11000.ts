/** Invoice create flow — SIV11000 (form) → SIV12000 (confirm) → SIV13000. */

/** One editable cart line on the create form. */
export interface InvoiceLine {
    productId: string;
    variantId?: string;
    variantName?: string;
    productCode?: string;
    productName: string;
    actualPrice: number;
    standardPrice?: number;
    quantity: number;
    discount: number;
    isFree?: boolean;
    /** The cashier typed a price — group pricing won't overwrite it. */
    manual?: boolean;
}

export interface InvoiceItemPayload {
    productId: string;
    variantId?: string;
    quantity: number;
    actualSellingPrice: number;
    discountAmount: number;
    isFreeItem: boolean;
}

export interface InvoicePaymentPayload {
    paymentMethodId: string;
    amount: number;
    receivedAmount: number;
    changeAmount: number;
}

export interface SIV11000CreatePayload {
    customerId?: string;
    inventoryId?: string;
    sellType: string;
    customerName?: string;
    salePersonId?: string;
    notes?: string;
    manualInvoiceDiscount: number;
    /** Set when the invoice is created from a quotation — the backend marks that
     *  quotation SOLD (no longer editable/re-sellable). */
    quotationNo?: string;
    items: InvoiceItemPayload[];
    payments: InvoicePaymentPayload[];
}

/** Confirm-screen summary line. */
export interface InvoiceDraftLine {
    name: string;
    qty: number;
    amount: number;
    free: boolean;
}

export interface InvoiceDraftDisplay {
    customerName: string;
    lines: InvoiceDraftLine[];
    subtotal: number;
    invoiceDiscount: number;
    total: number;
    paid: number;
    balance: number;
}

export interface InvoiceDraft {
    payload: SIV11000CreatePayload;
    display: InvoiceDraftDisplay;
    idempotencyKey: string;
}

export interface SIV11000CreateResponse {
    saleCode?: string;
}
