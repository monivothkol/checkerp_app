/** ACT23000 bank reconciliation: mark cash/bank journal lines as cleared. */

export interface ReconcileLine {
    lineId: string;
    entryDate?: string;
    journalNo?: string;
    sourceType?: string;
    description?: string;
    debitAmount?: number;
    creditAmount?: number;
    reconciled?: boolean;
    statementReference?: string | null;
}

export interface ReconcileAccountOption {
    accountCode: string;
    accountName: string;
}

export interface ReconcileListRequest {
    accountCode?: string;
    fromDate?: string;
    toDate?: string;
}

export interface ReconcileListResponse {
    accountList: ReconcileAccountOption[];
    lineList: ReconcileLine[];
    bookBalance: number;
    clearedBalance: number;
    unclearedBalance: number;
    reconciledCount?: number;
    totalCount?: number;
}

export interface SetReconciledRequest {
    lineId: string;
    reconciled: boolean;
    statementReference?: string;
}

export interface SetReconciledResponse {
    lineId: string;
    reconciled: boolean;
}
