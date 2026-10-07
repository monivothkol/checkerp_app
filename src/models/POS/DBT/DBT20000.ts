import type { CashAccount, LenderType } from "@/models/POS/DBT/DBT10000";

/** DBT20000 — record a loan / preview its schedule. */
export interface ScheduleRow {
    installmentNo: number;
    dueDate: string;
    principalDue: number | string;
    interestDue: number | string;
    paymentDue: number | string;
    balanceAfter: number | string;
    status?: "PAID" | "OVERDUE" | "DUE";
}

export interface LoanTermsRequest {
    principal: number;
    interestRate: number;
    startDate: string;
    termMonths: number;
}

export interface SchedulePreviewResponse {
    monthlyPayment: number | string;
    totalInterest: number | string;
    scheduleList: ScheduleRow[];
}

export interface CreateLoanRequest extends LoanTermsRequest {
    lenderName: string;
    lenderType: LenderType;
    receivedTo?: CashAccount;
    accountCode?: string;
    referenceNo?: string;
    remark?: string;
}

export interface CreateLoanResponse {
    loanId: string;
    loanCode: string;
}
