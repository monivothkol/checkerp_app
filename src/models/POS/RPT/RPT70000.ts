/** Credit exposure report — RPT70000. */
export interface CreditExposureRow {
    customerId: string;
    customerCode?: string;
    customerName?: string;
    policyName?: string;
    effectiveCreditLimit?: number | string;
    effectiveCreditTermDays?: number;
    effectiveMaxOverdue?: number | string;
    outstanding?: number | string;
    overdueAmount?: number | string;
    maxOverdueDays?: number;
    utilizationPct?: number;
    overLimit?: boolean;
}

export interface CreditExposureResponse {
    customersWithCredit: number;
    totalOutstanding?: number | string;
    totalOverdue?: number | string;
    overLimitCount?: number;
    totalElements: number;
    rows: CreditExposureRow[];
}
