/** Payroll run detail — PRM14000 (run header + items[]). */

import type { PayrollRunStatus } from "./PRM10000";

export interface PayrollRunHeader {
    runId?: string;
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

export interface PayrollRunItem {
    itemId: string;
    staffCode?: string;
    staffName?: string;
    basicSalary?: number;
    workingDaysUsed?: number;
    dailyRate?: number;
    totalEarnings?: number;
    totalDeductions?: number;
    netSalary?: number;
    isVerified?: boolean;
    isPaid?: boolean;
}

/** Header may come nested (p.run) or flat alongside items. */
export interface PRM14000Response extends PayrollRunHeader {
    run?: PayrollRunHeader;
    items?: PayrollRunItem[];
    itemList?: PayrollRunItem[];
}

/** Run-lifecycle actions (PRM14000I02 generate / I03 finalize / I04 void). */
export interface PayrollRunActionRequest {
    runId: string;
}

export interface PayrollRunActionResponse {
    runId: string;
    status?: string;
    lineCount?: number;
    postedCount?: number;
    consumedAdjustments?: number;
    paidCommissions?: number;
    reversedCount?: number;
    releasedAdjustments?: number;
    releasedCommissions?: number;
}
