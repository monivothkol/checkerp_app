/** Supplier balance statement — SUP17000 (supplier-side mirror of CUS17000). */

import type { SupplierLookup } from "@/models/POS/COMMON/lookups";

export interface BalanceBill {
    adjustmentId?: string;
    billCode: string;
    billDate?: string;
    grandTotal?: number;
    paidAmount?: number;
    outstandingAmount?: number;
    status: string;
    poCode?: string;
}

export interface BalancePurchaseReturn {
    adjustmentId?: string;
    returnCode: string;
    returnedAt?: string;
    status: string;
    returnAmount?: number;
    poCode?: string;
}

export interface SUP17000Request {
    supplierId: string;
    startDate?: string;
    endDate?: string;
}

export interface SUP17000Response {
    supplier?: SupplierLookup;
    startDate?: string;
    endDate?: string;
    bills: BalanceBill[];
    purchaseReturns: BalancePurchaseReturn[];
    totalBillsAmount?: number;
    totalPaidAmount?: number;
    totalReturnsAmount?: number;
    totalOutstandingAmount?: number;
    netBalance?: number;
    totalBillsCount?: number;
    totalReturnsCount?: number;
}
