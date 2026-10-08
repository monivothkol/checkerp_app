/** LVM11000I02 — days a leave request takes for the staff (their fixed days off are not counted). */
export interface LVM11000PreviewRequest {
    staffId?: string;
    startDate: string;
    endDate: string;
    isHalfDay?: boolean;
}

export interface LVM11000PreviewResponse {
    totalDays: number;
    calendarDays?: number;
}
