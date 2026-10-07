/** Sale return EDIT flow — SAL27000. Refills from SAL27000I02, submits SAL27000I01.
 *  PENDING returns only; no confirm step (mirrors the invoice/quotation edit). */
import type { ReturnItemPayload } from "@/models/POS/SAL/SAL21000";

/** One line of the edit-refill response (every sale line + this return's current qty/refund). */
export interface SAL27000EditItem {
    saleItemId: string;
    productCode?: string;
    productName: string;
    quantitySold: number;
    alreadyReturned: number;
    returnableQuantity: number;
    unitPrice: number;
    suggestedRefund: number;
    returnQty: number;
    refundAmount: number;
}

export interface SAL27000EditData {
    returnId: string;
    returnCode?: string;
    saleCode?: string;
    inventoryId?: string;
    customerName?: string;
    status?: string;
    notes?: string;
    items?: SAL27000EditItem[];
}

export interface SAL27000Request {
    returnId: string;
}

export interface SAL27000UpdatePayload {
    returnId: string;
    inventoryId?: string;
    notes?: string;
    itemList: ReturnItemPayload[];
}

export interface SAL27000UpdateResponse {
    returnId?: string;
    returnCode?: string;
}
