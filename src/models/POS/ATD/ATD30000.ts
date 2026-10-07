/**
 * Work-schedule screens: list (ATD30000), create flow (ATD31000 → ATD32000 →
 * ATD33000), detail (ATD34000) and staff assignment (ATD35000).
 */

export type BreakType = "NONE" | "FIXED" | "FLEXIBLE";

export interface ScheduleRow {
    scheduleId: string;
    scheduleCode?: string;
    name: string;
    nameKhmer?: string;
    startTime?: string;
    endTime?: string;
    breakType?: BreakType;
    breakMinutes?: number;
    /** JSON array string of ISO weekday numbers, e.g. "[1,2,3,4,5]". */
    workingDays?: string;
    isDefault?: boolean;
    isActive?: boolean;
    assignedStaffCount?: number;
}

export interface ScheduleAssignment {
    assignmentId: string;
    staffCode?: string;
    staffName?: string;
    effectiveFrom?: string;
    effectiveTo?: string;
}

export interface ATD30000Request {
    searchKeyword?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface ATD30000Response {
    totalCount: number;
    scheduleList: ScheduleRow[];
}

export interface ATD34000Request {
    scheduleId: string;
}

/** Schedule may come nested under `schedule` or flat; assignments under either key. */
export interface ATD34000Response extends ScheduleRow {
    schedule?: ScheduleRow;
    assignments?: ScheduleAssignment[];
    assignmentList?: ScheduleAssignment[];
}

export interface ATD31000Request {
    name: string;
    nameKhmer?: string;
    startTime?: string;
    endTime?: string;
    breakType: string;
    breakMinutes?: number;
    breakStart?: string;
    breakEnd?: string;
    workingDays: string;
}

export interface ATD31000Response {
    scheduleId?: string;
    scheduleCode?: string;
}

/** Human-readable summary shown on the ATD32000 confirm screen. */
export interface ScheduleDraftDisplay {
    name: string;
    nameKhmer: string;
    time: string;
    breakText: string;
    days: string;
}

/** Draft stashed in ModuleFlowStore between ATD31000 → ATD32000 → ATD33000. */
export interface ScheduleDraft {
    payload: ATD31000Request;
    idempotencyKey: string;
    display: ScheduleDraftDisplay;
}

/** Result stashed for the ATD33000 success screen. */
export interface ScheduleResult {
    scheduleId?: string;
    scheduleCode?: string;
    name: string;
}

export interface ATD35000Request {
    staffId?: string;
    scheduleId: string;
    effectiveFrom?: string;
    effectiveTo?: string;
}
