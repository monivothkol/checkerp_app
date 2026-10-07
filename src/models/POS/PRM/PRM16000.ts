/** Add Payroll Line — PRM16000 (manual adjustment line on a DRAFT run's payslip). */

export interface AddPayrollLineRequest {
    runId: string;
    staffId: string;
    adjustmentTypeId: string;
    amount: number;
    remark?: string;
}

export interface AddPayrollLineResponse {
    runId: string;
    itemId?: string;
    adjustmentId?: string;
}
