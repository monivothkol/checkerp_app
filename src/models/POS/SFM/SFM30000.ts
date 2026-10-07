/**
 * SFM30000 — post a staff financial transaction (loan disbursement/repayment,
 * advance issue/repayment, security deposit/refund).
 */
export interface CreateStaffFinancialTransactionRequest {
    staffId: string;
    transactionType: string;
    amount: number;
    referenceNo?: string;
    remark?: string;
    trnDate?: string;
}

export interface CreateStaffFinancialTransactionResponse {
    transactionId: string;
    accountType: string;
    signedAmount: number | string;
}
