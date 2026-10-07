/** PRM11000 — open a DRAFT payroll run for a period. */
export interface CreatePayrollRunRequest {
    periodMonth: string;
    departmentId?: string;
}

export interface CreatePayrollRunResponse {
    runId: string;
    status?: string;
    employeeCount?: number;
    lineCount?: number;
}

/** PRM19000 — set an editable recovery line's amount. */
export interface UpdatePayrollLineAmountRequest {
    lineId: string;
    amount: number;
}

export interface UpdatePayrollLineAmountResponse {
    lineId: string;
    amount: number | string;
}
