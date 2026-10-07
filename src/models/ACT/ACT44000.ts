/** ACT44000 accounting sync: operations that never reached the ledger + the opening balance. */

/** One operation type and how many of it have no journal entry. */
export interface SyncTypeRow {
    type: string; // SALE | PURCHASE_IN | PAYMENT | ... (posting order)
    missing: number;
}

export interface SyncPreviewResponse {
    enabled: boolean;
    /** Latest opening balance: everything up to it is already inside that entry. Null = from day one. */
    conversionDate?: string | null;
    types: SyncTypeRow[];
    totalMissing: number;
}

/** Why some operations could not be posted (e.g. "Account not found: 6600"). */
export interface SyncReason {
    reason: string;
    count: number;
}

/** The background sync job, as ACT44000I02 (start) and ACT44000I05 (status) report it. */
export interface SyncJobResponse {
    state: "IDLE" | "RUNNING" | "DONE" | "FAILED";
    total?: number;
    posted?: number;
    unpostable?: number; // tried and refused — needs a human
    type?: string | null; // the operation type being replayed right now
    reasons?: SyncReason[];
    message?: string;
}

/** One account: what is really held, what the ledger says, and the gap. */
export interface OpeningBalanceRow {
    key: string; // INVENTORY | ACCOUNTS_RECEIVABLE | ACCOUNTS_PAYABLE | CUSTOMER_CREDITS | CASH_USD
    accountCode: string;
    debitNormal: boolean;
    actual: number;
    ledger: number;
    delta: number;
}

export interface OpeningBalanceRequest {
    countedCash?: number | null;
}

export interface OpeningBalancePreviewResponse {
    rows: OpeningBalanceRow[];
    equityAccountCode: string;
    equityDelta: number;
    pendingSync: number;
}

export interface OpeningBalancePostResponse {
    journalNo?: string;
    lineCount: number;
    equityDelta: number;
}
