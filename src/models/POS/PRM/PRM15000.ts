/** Payslip detail — PRM15000 (item + earning/deduction lines[]). */

export interface PayslipLine {
    lineId?: string;
    label: string;
    category: string;
    source?: string;
    accountType?: string;
    amount?: number;
    editable?: boolean;
    /** Free-text note the engine wrote (e.g. "3 late -> 0.5 day"). */
    meta?: string;
    /** The row this line came from — commission_recipients id on COMMISSION lines. */
    sourceRefId?: string;
    /** Set only on COMMISSION lines: the commission this payment belongs to. */
    commissionId?: string;
    /** FINANCIAL lines only: the loan/advance balance this line repays (live on draft, snapshot once finalized). */
    accountBalance?: number | null;
}

export interface PayslipItem {
    itemId?: string;
    runId?: string;
    staffId?: string;
    staffCode?: string;
    staffName?: string;
    basicSalary?: number;
    workingDaysUsed?: number;
    dailyRate?: number;
    netSalary?: number;
    currency?: string;
    runStatus?: string;
    isVerified?: boolean;
    verifiedAt?: string;
    isPaid?: boolean;
    paidAt?: string;
}

/** PRM15000I03 / PRM15000I04 — verify/pay marks on a FINALIZED run's payslip. */
export interface MarkPayslipRequest {
    itemId: string;
    verified?: boolean;
    paid?: boolean;
}

export interface MarkPayslipResponse {
    itemId: string;
    isVerified?: boolean;
    isPaid?: boolean;
}

/** PRM15000I02 — remove a MANUAL line (and its PENDING backing adjustment). */
export interface RemovePayrollLineRequest {
    lineId: string;
}

export interface RemovePayrollLineResponse {
    lineId: string;
    runId?: string;
}

/** Item may come nested (p.item) or flat alongside lines. */
export interface PRM15000Response extends PayslipItem {
    item?: PayslipItem;
    lines?: PayslipLine[];
    lineList?: PayslipLine[];
}
