// POS sale invoice view-model (POS12000 response). A sale IS the invoice.

export interface InvoiceStore {
    name?: string;
    legalName?: string;
    address?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    /** Company tax identification number (VAT TIN), printed under the address. */
    taxId?: string;
    terms?: string;
}

export interface InvoiceItem {
    lineNo?: number;
    productId?: string;
    variantId?: string;
    sellType?: string;
    productCode?: string;
    productName?: string;
    unitName?: string;
    quantity?: number | string;
    unitPrice?: number | string;
    standardPrice?: number | string;
    discountAmount?: number | string;
    subtotal?: number | string;
    amount?: number | string;
    isFreeItem?: boolean;
    isBundle?: boolean;
    bundleName?: string;
}

export interface InvoicePayment {
    methodName?: string;
    amount?: number | string;
    receivedAmount?: number | string;
    changeAmount?: number | string;
    referenceNumber?: string;
    paymentDate?: string;
}

export interface SaleInvoice {
    saleCode?: string;
    saleDate?: string;
    sequenceNumber?: number;
    inventoryId?: string;
    customerId?: string;
    salePersonId?: string;
    status?: string;
    statusName?: string;
    paymentStatus?: string;
    paymentStatusName?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    subtotal?: number | string;
    discountAmount?: number | string;
    manualInvoiceDiscount?: number | string;
    creditAppliedAmount?: number | string;
    taxAmount?: number | string;
    totalAmount?: number | string;
    paidAmount?: number | string;
    changeAmount?: number | string;
    notes?: string;
    /** Latest non-cancelled packaging/delivery for this sale, if any — drives the
     *  invoice's Create-vs-View action buttons. */
    packagingId?: string;
    deliveryId?: string;
    store?: InvoiceStore;
    items?: InvoiceItem[];
    payments?: InvoicePayment[];
}

/** One invoice change-history entry (SIV13000I04). oldValues/newValues are JSON
 *  strings of the CHANGED fields only. */
export interface InvoiceAuditEntry {
    changedAt?: string;
    action?: string;
    userName?: string;
    username?: string;
    oldValues?: string;
    newValues?: string;
}

export interface InvoiceAuditResponse {
    auditList?: InvoiceAuditEntry[];
}
