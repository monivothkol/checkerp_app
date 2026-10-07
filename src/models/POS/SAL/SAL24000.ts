/** Sale return detail — SAL24000. Header may be nested under `return`, items under `items`/`itemList`. */

import type { InvoiceStore } from "@/models/POS/invoice";

export interface ReturnDetailItem {
    productCode?: string;
    productName?: string;
    quantitySold?: number;
    quantityReturned?: number;
    unitPrice?: number;
    refundAmount?: number;
}

export interface ReturnDetailHeader {
    returnId?: string;
    returnCode?: string;
    saleCode?: string;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    status?: string;
    returnedAt?: string;
    notes?: string;
    creditNoteCode?: string;
    approvedBy?: string;
    approvedByCode?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedByCode?: string;
    rejectedAt?: string;
    store?: InvoiceStore;
    totalRefund?: number;
    items?: ReturnDetailItem[];
    itemList?: ReturnDetailItem[];
}

export interface SAL24000Response extends ReturnDetailHeader {
    return?: ReturnDetailHeader;
}
