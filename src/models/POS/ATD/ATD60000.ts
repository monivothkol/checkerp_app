/** Day-off calendar (ATD60000): who is off on which date. An unmarked day is a working day. */

export interface DayOffMark {
    date: string;
    staffId: string;
    staffCode?: string;
    staffName?: string;
}

export interface DayOffStaff {
    staffId: string;
    staffCode?: string;
    staffName?: string;
    departmentId?: string;
}

export interface ATD60000Request {
    startDate: string;
    endDate: string;
    departmentId?: string;
}

export interface ATD60000Response {
    dayOffList: DayOffMark[];
    staffList: DayOffStaff[];
}

/** ATD60000I02 — replaces the date's marks (within the department, when given); repeatWeeks copies it weekly. */
export interface ATD60000SaveRequest {
    date: string;
    staffIds: string[];
    departmentId?: string;
    repeatWeeks?: number;
}

export interface ATD60000SaveResponse {
    dates: string[];
    staffCount: number;
}

/** What the day editor returns to the calendar. */
export interface DayOffEdit {
    staffIds: string[];
    repeatWeeks: number;
}
