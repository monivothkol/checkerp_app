/** Quotation detail — SAL15000. */

export interface QuotationDetailItem {
    lineNo?: number;
    productId?: string;
    variantId?: string;
    variantName?: string;
    productCode?: string;
    productName?: string;
    quantity?: number;
    unitPrice?: number;
    discountAmount?: number;
    amount?: number;
}

/** Backend may name totals subTotalAmount/subTotal/subtotal and discountAmount/discountTotal (SAL15000I01 sends subTotalAmount). */
export interface QuotationDetail {
    quotationNo?: string;
    customerName?: string;
    phoneNo?: string;
    quotationDate?: string;
    inventoryId?: string;
    inventoryName?: string;
    remark?: string;
    subTotalAmount?: number;
    subTotal?: number;
    subtotal?: number;
    discountAmount?: number;
    discountTotal?: number;
    totalAmount?: number;
    status?: string;
    quotationStatusCode?: string;
    quotationStatusName?: string;
    saleCode?: string;
    itemList?: QuotationDetailItem[];
    store?: import("@/models/POS/invoice").InvoiceStore;
}

export type SAL15000Response = QuotationDetail;
