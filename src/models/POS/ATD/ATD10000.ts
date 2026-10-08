/** Attendance daily list (ATD10000), summary (ATD15000) and detail (ATD14000). */

export interface AttendanceRow {
    attendanceId: string;
    date?: string;
    staffId?: string;
    staffCode?: string;
    staffName?: string;
    checkIn?: string;
    breakCheckOut?: string;
    breakCheckIn?: string;
    checkOut?: string;
    workedMinutes?: number;
    breakMinutes?: number;
    lateMinutes?: number;
    status: string;
    source?: string;
}

/** Detail view adds an optional remark on top of the list row shape. */
export interface AttendanceDetail extends AttendanceRow {
    remark?: string;
    scheduleName?: string;
}

/** Date-range + status filter shared by the list and summary calls. */
export interface AttendanceFilter {
    startDate?: string;
    endDate?: string;
    status?: string;
}

export interface ATD10000Request extends AttendanceFilter {
    pageNo?: number;
    pageSize?: number;
}

export interface ATD10000Response {
    totalCount: number;
    attendanceList: AttendanceRow[];
}

/** One per-status count shown in the summary strip. */
export interface AttendanceSummaryRow {
    status: string;
    count: number;
}

export interface ATD15000Response {
    summary: AttendanceSummaryRow[];
    total: number;
}

export interface ATD14000Request {
    attendanceId: string;
}

/** Record may come nested under `attendance` or flat on the payload. */
export interface ATD14000Response extends AttendanceDetail {
    attendance?: AttendanceDetail;
}

/** ATD10000I04: record Not scanned days as approved leave of one type. */
export interface RecordLeaveRequest {
    attendanceIds: string[];
    leaveTypeId: string;
}

export interface RecordLeaveResponse {
    recorded: number;
}

/** What the leave-type picker returns. */
export interface RecordLeaveChoice {
    leaveTypeId: string;
}

/** One choice in the Record-as-leave picker; remainingDays only when one staff is picked. */
export interface LeaveOption {
    leaveTypeId: string;
    name: string;
    isPaid: boolean;
    remainingDays?: number;
}
