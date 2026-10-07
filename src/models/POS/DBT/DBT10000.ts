/** Loan register row — DBT10000. */
export const LENDER_TYPES = ["BANK", "MICROFINANCE", "OWNER", "SUPPLIER", "OTHER"] as const;
export type LenderType = (typeof LENDER_TYPES)[number];
export type LoanStatus = "ACTIVE" | "CLOSED";
export type CashAccount = "CASH" | "BANK";

export interface LoanRow {
    loanId: string;
    loanCode: string;
    lenderName: string;
    lenderType: LenderType;
    principal: number | string;
    interestRate: number | string;
    startDate: string;
    termMonths: number;
    monthlyPayment: number | string;
    accountCode: string;
    receivedTo: CashAccount;
    principalPaid: number | string;
    interestPaid: number | string;
    outstanding: number | string;
    currentPortion: number | string;
    longTermPortion: number | string;
    status: LoanStatus;
    referenceNo?: string;
    remark?: string;
    createdAt?: string;
}

export interface LoanTotals {
    principal: number | string;
    outstanding: number | string;
    currentPortion: number | string;
    longTermPortion: number | string;
}

export interface DBT10000Response {
    totalCount: number;
    loanList: LoanRow[];
    totals?: LoanTotals;
}
