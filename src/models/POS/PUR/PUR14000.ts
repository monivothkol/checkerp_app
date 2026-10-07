/** PO detail — PUR14000. Tolerant read: header may nest under `po`. */

export interface PurchaseOrderDetailItem {
    productId?: string;
    variantId?: string;
    productCode?: string;
    productName?: string;
    orderedQuantity?: number;
    receivedQuantity?: number;
    unitCost?: number;
    discountAmount?: number;
    taxRate?: number;
    taxAmount?: number;
    lineTotal?: number;
}

export interface PurchaseOrderDetail {
    poId?: string;
    supplierId?: string;
    inventoryId?: string;
    poCode?: string;
    supplierName?: string;
    inventoryName?: string;
    status?: string;
    orderDate?: string;
    expectedDeliveryDate?: string;
    paymentTerm?: string;
    remark?: string;
    subtotal?: number;
    subTotal?: number;
    discountAmount?: number;
    discountTotal?: number;
    taxAmount?: number;
    taxTotal?: number;
    grandTotal?: number;
    items?: PurchaseOrderDetailItem[];
    itemList?: PurchaseOrderDetailItem[];
}

export interface PUR14000Response extends PurchaseOrderDetail {
    po?: PurchaseOrderDetail;
}

/** PUR14000I02/I03/I04 approve/reject/cancel result. */
export interface PurchaseOrderTransitionResponse {
    poId: string;
    status: string;
}
