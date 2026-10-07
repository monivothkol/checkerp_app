/**
 * Payroll adjustment create flow — PRM21000 (form) → PRM22000 (confirm) →
 * PRM23000 (result), plus PRM24000 detail.
 */

import type { AdjustmentCategory, AdjustmentStatus } from "./PRM20000";

/** Adjustment type option (PRM25000). Backend may name the id typeId/id/adjustmentTypeId. */
export interface AdjustmentType {
    typeId?: string;
    id?: string;
    adjustmentTypeId?: string;
    name?: string;
    typeName?: string;
    category?: AdjustmentCategory;
}

/** Normalized {id,name} option shown in the staff dropdown. */
export interface StaffOption {
    id: string;
    name: string;
}

/** Normalized adjustment-type option shown in the type dropdown. */
export interface AdjustmentTypeOption {
    id?: string;
    name?: string;
    category?: AdjustmentCategory;
}

export interface PRM21000CreatePayload {
    staffId?: string;
    adjustmentTypeId?: string;
    amount?: number;
    effectiveMonth: string;
    remark?: string;
}

export interface AdjustmentDraftDisplay {
    staffName: string;
    typeName: string;
    category: AdjustmentCategory;
    amount: number;
    month: string;
    remark: string;
}

/** Draft stashed in ModuleFlowStore between PRM21000 → PRM22000 → PRM23000. */
export interface AdjustmentDraft {
    payload: PRM21000CreatePayload;
    display: AdjustmentDraftDisplay;
    idempotencyKey: string;
}

export interface PRM21000CreateResponse {
    adjustmentId?: string;
}

/** Result stashed for the PRM23000 success screen. */
export interface AdjustmentResult {
    adjustmentId?: string;
    staffName: string;
    typeName: string;
}

/** PRM24000 detail — may come nested (p.adjustment) or flat. */
export interface AdjustmentDetail {
    adjustmentId?: string;
    staffName?: string;
    typeName?: string;
    category: AdjustmentCategory;
    amount?: number;
    effectiveMonth: string;
    status: AdjustmentStatus;
    remark?: string;
    createdAt?: string;
}

export interface PRM24000Response extends AdjustmentDetail {
    adjustment?: AdjustmentDetail;
}
