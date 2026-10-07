export interface ActAccount {
    accountCode: string;
    accountName: string;
    accountNameKh?: string;
    accountType: string;
    accountSubtype?: string;
    parentCode?: string;
    normalBalance: string;
    isHeader: boolean;
    isSystem: boolean;
    isRestricted: boolean;
    isReconcilable?: boolean;
    isActive: boolean;
    description?: string;
}

export interface ActJournalRow {
    journalNo: string;
    entryDate: string;
    description?: string;
    sourceType: string;
    sourceCode?: string;
    journalStatusCode: string;
    totalDebit: number;
    totalCredit: number;
}

export interface ActJournalLine {
    lineNo: number;
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    description?: string;
    originalAmount?: number;
    originalCurrency?: string;
}

export interface ActJournalDetail extends ActJournalRow {
    currency?: string;
    notes?: string;
    reversedByNo?: string;
    reversalOfNo?: string;
    lineList: ActJournalLine[];
}

export interface ActReportRow {
    accountCode: string;
    accountName: string;
    accountType: string;
    normalBalance?: string;
    totalDebit?: number;
    totalCredit?: number;
    balance?: number;
    amount?: number;
}

export interface ActLedgerRow {
    entryDate: string;
    journalNo: string;
    sourceType: string;
    sourceCode?: string;
    description?: string;
    debitAmount: number;
    creditAmount: number;
    balance: number;
}

/** ACT33000 general ledger: one account's block (QuickBooks-style report section). */
export interface ActLedgerSection {
    accountCode: string;
    accountName: string;
    accountType: string;
    normalBalance: string;
    openingBalance: number;
    totalDebit: number;
    totalCredit: number;
    closingBalance: number;
    ledgerList: ActLedgerRow[];
}
