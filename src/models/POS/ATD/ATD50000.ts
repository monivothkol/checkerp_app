/** Attendance rules — ATD50000I01 (load) / ATD50000I02 (save). Values are DAYS deducted, not money. */

/** One late-penalty tier: at thresholdCount lates in a month, deduct deductionDays. */
export interface AttendanceLateRule {
    thresholdCount?: number;
    deductionDays?: number;
}

export interface AttendanceRules {
    workingDaysPerMonth?: number;
    absentDeductionDays?: number;
    missingMorningDeductionDays?: number;
    missingAfternoonDeductionDays?: number;
    missingFulldayDeductionDays?: number;
    unpaidLeaveDeductionPerDay?: number;
    /** Nightly: mark no-scan days as Day off / Not scanned / On leave (off until the company scans in this system). */
    autoMarkDays?: boolean;
    lateRules?: AttendanceLateRule[];
}

export type ATD50000Response = AttendanceRules;
