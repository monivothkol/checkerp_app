/** Payroll adjustment list — PRM20000. */

export type AdjustmentCategory = "EARNING" | "DEDUCTION";
export type AdjustmentStatus = "PENDING" | "CONSUMED";

export interface AdjustmentRow {
    adjustmentId: string;
    staffName?: string;
    typeName?: string;
    category: AdjustmentCategory;
    amount?: number;
    effectiveMonth: string;
    status: AdjustmentStatus;
    remark?: string;
    createdAt?: string;
}

export interface PRM20000Request {
    pageNo?: number;
    pageSize?: number;
    effectiveMonth?: string;
    status?: string;
}

export interface PRM20000Response {
    totalCount: number;
    adjustmentList: AdjustmentRow[];
}
