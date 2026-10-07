/** Purchase-in detail — PUR24000. Tolerant read: header may nest under
 * `purchaseIn` / `adjustment`. */

export interface PurchaseInDetailItem {
    productCode?: string;
    productName?: string;
    quantityDifference?: number;
    unitCost?: number;
    discountAmount?: number;
    taxAmount?: number;
    taxRecoverable?: boolean;
    lineTotal?: number;
}

export interface PurchaseInDetail {
    adjustmentCode?: string;
    supplierName?: string;
    inventoryName?: string;
    poCode?: string;
    status?: string;
    receivedStatus?: string;
    paidAmount?: number;
    supplierInvoiceId?: string;
    notes?: string;
    adjustedAt?: string;
    subtotal?: number;
    subTotal?: number;
    discountAmount?: number;
    discountTotal?: number;
    taxAmount?: number;
    taxTotal?: number;
    grandTotal?: number;
    items?: PurchaseInDetailItem[];
    itemList?: PurchaseInDetailItem[];
}

export interface PUR24000Response extends PurchaseInDetail {
    purchaseIn?: PurchaseInDetail;
    adjustment?: PurchaseInDetail;
}
