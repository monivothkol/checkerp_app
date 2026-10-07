/** Leave balances (LVM40000I01) and per-type summary (LVM40000I02). */

export interface LeaveBalance {
    leaveTypeId: string;
    leaveTypeName?: string;
    code?: string;
    year?: number;
    totalDays?: number;
    usedDays?: number;
    carriedDays?: number;
    remainingDays?: number;
}

export interface LeaveBalanceRequest {
    staffId?: string;
    year?: number;
}

export interface LeaveBalanceResponse {
    staffId?: string;
    year?: number;
    balanceList: LeaveBalance[];
}

export interface LeaveSummaryRow {
    leaveTypeId: string;
    leaveTypeName?: string;
    code?: string;
    totalDays?: number;
    usedDays?: number;
}

export interface LeaveSummaryRequest {
    year?: number;
    staffId?: string;
}

export interface LeaveSummaryResponse {
    summaryList: LeaveSummaryRow[];
}
