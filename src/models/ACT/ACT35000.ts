/** Balance statement (business snapshot) — ACT35000. */
export interface BalanceStatementAssets {
    cash?: number | string;
    accountsReceivable?: number | string;
    inventoryValue?: number | string;
    otherCurrentAssets?: number | string;
    fixedAssets?: number | string;
    totalCurrentAssets?: number | string;
    totalAssets?: number | string;
}

export interface BalanceStatementLiabilities {
    accountsPayable?: number | string;
    shortTermDebt?: number | string;
    longTermDebt?: number | string;
    totalCurrentLiabilities?: number | string;
    totalLiabilities?: number | string;
}

export interface BalanceStatementEquity {
    retainedEarnings?: number | string;
    ownerEquity?: number | string;
    totalEquity?: number | string;
}

export interface BalanceStatementResponse {
    reportDate?: string;
    assets?: BalanceStatementAssets;
    liabilities?: BalanceStatementLiabilities;
    equity?: BalanceStatementEquity;
    totalLiabilitiesAndEquity?: number | string;
}

/** ACT35100 — export the statement as a book-format file. */
export interface ExportBalanceStatementRequest {
    asOfDate?: string;
    format: "pdf" | "excel";
}

export interface ExportBalanceStatementResponse {
    url: string;
    fileName: string;
    balanced: boolean;
}
