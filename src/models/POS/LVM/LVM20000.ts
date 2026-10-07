/** Leave types: list (LVM20000) and create (LVM21000). */

export interface LeaveType {
    leaveTypeId: string;
    code?: string;
    name: string;
    nameKhmer?: string;
    defaultDaysPerYear?: number;
    isPaid?: boolean;
    requiresAttachment?: boolean;
    maxConsecutiveDays?: number;
    isActive?: boolean;
}

export interface LVM20000Response {
    typeList: LeaveType[];
}

export interface LVM21000Request {
    name: string;
    nameKhmer?: string;
    code: string;
    defaultDaysPerYear: number;
    isPaid: boolean;
    requiresAttachment: boolean;
    maxConsecutiveDays?: number;
}

/** LVM20000I03 - update a leave type (code immutable, so not sent). */
export interface LeaveTypeUpdateRequest {
    leaveTypeId: string;
    name: string;
    nameKhmer?: string;
    defaultDaysPerYear: number;
    isPaid: boolean;
    requiresAttachment: boolean;
    maxConsecutiveDays?: number;
}

/** LVM20000I04 delete / I05 restore. */
export interface LeaveTypeIdRequest {
    leaveTypeId: string;
}

export interface LeaveTypeActiveResponse {
    leaveTypeId: string;
    isActive: boolean;
}
