/** Commission list row — RPT80000. */
export interface CommissionListItem {
    commissionId: string;
    commissionCode: string;
    startDate?: string;
    endDate?: string;
    criteriaType?: string;
    inputType?: string;
    inputValue?: number | string;
    totalCommissionAmount?: number | string;
    applyToType?: string;
    status?: string;
    createdAt?: string;
    recipientCount?: number;
}

export interface CommissionListResponse {
    totalCount: number;
    commissionList: CommissionListItem[];
}

/** Calculate / save input (RPT81000 / RPT42000). */
export interface CommissionCalcRequest {
    startDate: string;
    endDate: string;
    criteriaType: string;
    inputType: string;
    inputValue: number;
    applyToType: string;
    applyToFilters: string[];
    distributionType: string;
    inventoryId?: string;
    remark?: string;
}

export interface CommissionRecipientRow {
    recipientId?: string;
    recipientName?: string;
    department?: string | null;
    position?: string | null;
    commissionAmount: number | string;
    sharePercentage?: number | string;
    individualCriteriaValue?: number | string | null;
    paymentStatus?: string;
}

/** RPT81000 calculate preview result. */
export interface CommissionCalcResult {
    criteriaValue: number | string;
    totalCommissionAmount: number | string;
    recipientCount: number;
    recipients: CommissionRecipientRow[];
}

/** RPT42000 save result. */
export interface CommissionSaveResponse {
    commissionId: string;
    commissionCode: string;
    totalCommissionAmount: number | string;
}

/** RPT82000 detail (header + recipients). */
export interface CommissionDetail extends CommissionListItem {
    criteriaValue?: number | string;
    distributionType?: string;
    /** What actually decided each payout: INDIVIDUAL_SALES | EQUAL_SPLIT | FULL_EACH. */
    payoutBasis?: string;
    inventoryId?: string | null;
    remark?: string | null;
    rejectionReason?: string | null;
    recipients?: CommissionRecipientRow[];
}

/** RPT43000/44000 action result. */
export interface CommissionActionResponse {
    commissionId: string;
    status: string;
}
