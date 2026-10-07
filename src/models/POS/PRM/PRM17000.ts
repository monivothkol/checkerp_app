/** Apply Commission — PRM17000 (applicable list + apply on a DRAFT run). */

export interface ApplicableCommission {
    commissionId: string;
    commissionCode?: string;
    applyToType?: string;
    startDate?: string;
    endDate?: string;
    recipientCount?: number;
    totalAmount?: number;
}

export interface ApplicableCommissionsRequest {
    runId: string;
}

export interface ApplicableCommissionsResponse {
    commissionList?: ApplicableCommission[];
}

export interface ApplyCommissionRequest {
    runId: string;
    commissionId: string;
}

export interface ApplyCommissionResponse {
    runId: string;
    commissionId?: string;
    appliedCount?: number;
    totalAmount?: number;
}
