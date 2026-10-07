import type { CashAccount, LoanRow } from "@/models/POS/DBT/DBT10000";
import type { ScheduleRow } from "@/models/POS/DBT/DBT20000";

/** DBT30000 — loan detail: schedule + payments, and recording a repayment. */
export interface LoanPaymentRow {
    paymentId: string;
    paymentDate: string;
    principalAmount: number | string;
    interestAmount: number | string;
    totalAmount: number | string;
    paidFrom: CashAccount;
    referenceNo?: string;
    remark?: string;
}

export interface LoanDetailResponse extends LoanRow {
    scheduleList: ScheduleRow[];
    paymentList: LoanPaymentRow[];
}

export interface RecordRepaymentRequest {
    loanId: string;
    paymentDate: string;
    principalAmount: number;
    interestAmount: number;
    paidFrom?: CashAccount;
    referenceNo?: string;
    remark?: string;
}

export interface RecordRepaymentResponse {
    paymentId: string;
    outstanding: number | string;
    status: "ACTIVE" | "CLOSED";
}
