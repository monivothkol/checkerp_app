/** Invoice edit — SIV15000 (loads via SIV13000, saves via SIV15000). */

import type { InvoiceItemPayload } from "./SIV11000";

export interface SIV15000UpdatePayload {
    saleCode: string;
    sellType: string;
    customerName?: string;
    customerPhone?: string;
    salePersonId?: string;
    notes?: string;
    manualInvoiceDiscount: number;
    items: InvoiceItemPayload[];
}

export interface SIV15000UpdateResponse {
    saleCode?: string;
    totalAmount?: number;
    paymentStatus?: string;
}
