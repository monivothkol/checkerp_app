/** Customer balance statement — CUS17000. */

import type { CustomerLookup } from "@/models/POS/COMMON/lookups";
import type { InvoiceStore } from "@/models/POS/invoice";

export interface BalanceInvoice {
    saleId?: string;
    saleCode: string;
    saleDate?: string;
    totalAmount?: number;
    paidAmount?: number;
    outstandingAmount?: number;
    paymentStatus: string;
}

export interface BalanceStockReturn {
    returnId?: string;
    returnCode: string;
    returnedAt?: string;
    saleCode?: string;
    returnAmount?: number;
    status: string;
}

/** One merged statement ledger row (invoice or return), pre-sorted latest-first by the backend. */
export interface StatementLedgerRow {
    date: string;
    type: "INVOICE" | "RETURN";
    code?: string;
    reference?: string;
    amount?: number;
    status?: string;
}

export interface CUS17000Request {
    customerId: string;
    startDate?: string;
    endDate?: string;
}

export interface CUS17000Response {
    customer?: CustomerLookup;
    store?: InvoiceStore;
    ledger?: StatementLedgerRow[];
    startDate?: string;
    endDate?: string;
    invoices: BalanceInvoice[];
    stockReturns: BalanceStockReturn[];
    totalInvoicesAmount?: number;
    totalPaidAmount?: number;
    totalReturnsAmount?: number;
    totalOutstandingAmount?: number;
    netBalance?: number;
    totalInvoicesCount?: number;
    totalReturnsCount?: number;
}
