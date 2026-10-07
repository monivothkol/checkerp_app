/**
 * Leave requests: list (LVM10000), create flow (LVM11000 → LVM12000 →
 * LVM13000) and detail (LVM14000).
 */

export interface LeaveRequestRow {
    requestId: string;
    staffCode?: string;
    staffName?: string;
    leaveTypeName?: string;
    startDate?: string;
    endDate?: string;
    totalDays?: number;
    isHalfDay?: boolean;
    status: string;
    reason?: string;
    currentStep?: number;
    createdAt?: string;
}

export interface LVM10000Request {
    pageNo?: number;
    pageSize?: number;
    staffId?: string;
    status?: string;
}

export interface LVM10000Response {
    totalCount: number;
    requestList: LeaveRequestRow[];
}

// ── Create flow ──
export interface LVM11000Request {
    staffId?: string;
    leaveTypeId?: string;
    startDate: string;
    endDate: string;
    isHalfDay: boolean;
    reason?: string;
    approverStaffIds: string[];
    followerStaffIds: string[];
}

export interface LVM11000Response {
    requestId?: string;
    totalDays?: number;
    approverCount?: number;
}

/** Human-readable summary shown on the LVM12000 confirm screen. */
export interface LeaveDraftDisplay {
    staffName: string;
    typeName: string;
    startDate: string;
    endDate: string;
    isHalfDay: boolean;
    days: number;
    approvers: string[];
    followers: string[];
    reason: string;
}

/** Draft stashed in ModuleFlowStore between LVM11000 → LVM12000 → LVM13000. */
export interface LeaveDraft {
    payload: LVM11000Request;
    idempotencyKey: string;
    display: LeaveDraftDisplay;
}

/** Result stashed for the LVM13000 success screen. */
export interface LeaveResult {
    requestId?: string;
    totalDays?: number;
    approverCount?: number;
    staffName: string;
    typeName: string;
}

// ── Detail ──
export interface LeaveApproval {
    stepOrder: number;
    approverName?: string;
    approverCode?: string;
    status: string;
    isCurrent?: boolean;
    actedAt?: string;
    comment?: string;
}

export interface LeaveFollower {
    staffName?: string;
    staffCode?: string;
}

export interface LeaveRequestHeader {
    status: string;
    staffName?: string;
    staffCode?: string;
    leaveTypeName?: string;
    startDate?: string;
    endDate?: string;
    totalDays?: number;
    isHalfDay?: boolean;
    reason?: string;
    rejectionReason?: string;
    createdAt?: string;
    approvals?: LeaveApproval[];
    followers?: LeaveFollower[];
}

export interface LVM14000Request {
    requestId: string;
}

/** Header may come nested under `request` or flat; approvals/followers under either. */
export interface LVM14000Response extends LeaveRequestHeader {
    request?: LeaveRequestHeader;
}

/** LVM14000I02 approve / LVM14000I03 reject — act on a PENDING request's current step. */
export interface ActLeaveRequest {
    requestId: string;
    comment?: string;
}

export interface ActLeaveResponse {
    requestId: string;
    status?: string;
    currentStep?: number;
}

/** LVM14000I04 - cancel a PENDING request. */
export interface CancelLeaveRequest {
    requestId: string;
}

export interface CancelLeaveResponse {
    requestId: string;
    status?: string;
}

/** LVM10000I02 - "my approvals" inbox (approverStaffId defaults to the caller). */
export interface PendingApprovalsRequest {
    approverStaffId?: string;
}

export interface PendingApprovalsResponse {
    requestList: LeaveRequestRow[];
}
