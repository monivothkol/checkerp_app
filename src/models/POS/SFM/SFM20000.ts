/** Staff financial account detail — SFM20000. */
export interface StaffFinancialDetail {
    staffId: string;
    staffCode: string;
    staffName: string;
    loanBalance: number | string;
    advanceBalance: number | string;
    depositBalance: number | string;
    loanRecommendedDeduction?: number | string | null;
    advanceRecommendedDeduction?: number | string | null;
}

/** One ledger row in a staff's transaction history (SFM20000I01). */
export interface StaffFinancialTransaction {
    transactionId: string;
    accountType: string;
    transactionType: string;
    signedAmount: number | string;
    balanceAfter: number | string;
    referenceNo?: string | null;
    remark?: string | null;
    trnDate?: string | null;
}

/** SFM20000I01 — paged transaction history shown inside the detail screen. */
export interface StaffFinancialTransactionsResponse {
    totalCount: number;
    transactionList: StaffFinancialTransaction[];
}
