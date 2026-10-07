/** Filter-wide money totals for the list summary row. */
export interface PRM10000ListTotals {
    totalGross?: number;
    totalDeduction?: number;
    totalNet?: number;
}

/** Payroll run list — PRM10000. */

export type PayrollRunStatus = "DRAFT" | "FINALIZED" | "VOID";

export interface PayrollRunRow {
    runId: string;
    periodMonth: string;
    departmentName?: string;
    status: PayrollRunStatus;
    currency?: string;
    totalGross?: number;
    totalDeduction?: number;
    totalNet?: number;
    employeeCount?: number;
    createdAt?: string;
    finalizedAt?: string;
}

export interface PRM10000Request {
    pageNo?: number;
    pageSize?: number;
    periodMonth?: string;
    status?: string;
}

export interface PRM10000Response {
    totals?: PRM10000ListTotals;
    totalCount: number;
    runList: PayrollRunRow[];
}
