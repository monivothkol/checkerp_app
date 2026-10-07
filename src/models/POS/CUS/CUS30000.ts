/**
 * Loyalty point condition screens (CUS30000 list / CUS31000 create /
 * CUS34000 detail) and the edit modal. conditionValue is a JSON string whose
 * shape depends on conditionType — see core/modules/loyalty-condition.ts.
 */

export type LoyaltyConditionType =
    | "INVOICE_AMOUNT"
    | "PAID_INVOICE_AMOUNT"
    | "SPECIFIC_PRODUCT"
    | "PRODUCT_CATEGORY"
    | "PRODUCT_BRAND";

export interface LoyaltyConditionRow {
    conditionId: string;
    conditionName: string;
    conditionType: LoyaltyConditionType;
    conditionValue: string;
    pointReward: number;
    isActive: boolean;
}

export interface CUS30000Request {
    searchKeyword?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface CUS30000Response {
    totalCount: number;
    conditionList: LoyaltyConditionRow[];
}

export interface CUS31000Request {
    conditionName: string;
    conditionType: LoyaltyConditionType;
    conditionValue: string;
    pointReward: number;
}

export interface CUS31000Response {
    conditionId: string;
    conditionName: string;
}

/** CUS35000 edit — only name/reward/active mutate (rule is immutable). */
export interface CUS35000Request {
    conditionId: string;
    conditionName: string;
    pointReward: number;
    isActive: boolean;
}

export interface CUS34000Request {
    conditionId: string;
}

// ── CUS31000 create form picker sources ──
export interface CategoryOption {
    categoryId: string;
    categoryName: string;
}

export interface BrandOption {
    brandId: string;
    brandName: string;
}

/** Normalized {id,name} option shown in the target dropdown. */
export interface TargetOption {
    id: string;
    name: string;
}

/** Human-readable summary shown on the confirm screen. */
export interface LoyaltyDraftDisplay {
    name: string;
    type: string;
    condition: string;
    points: number;
}

/** Draft stashed in ModuleFlowStore between CUS31000 → CUS32000 → CUS33000. */
export interface LoyaltyDraft {
    payload: CUS31000Request;
    display: LoyaltyDraftDisplay;
    idempotencyKey: string;
}

/** Result stashed for the CUS33000 success screen. */
export interface LoyaltyResult {
    conditionId?: string;
    name: string;
}
