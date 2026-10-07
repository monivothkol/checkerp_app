/** Promotion create flow — PMM20000 (form) → PMM30000 (confirm) → PMM40000. */

/** Editable target chip on the create form. */
export interface PromotionTarget {
    targetType: string;
    targetId: string;
    targetName: string;
}

/** Editable bundle line on the create form. */
export interface PromotionBundleItem {
    productId: string;
    productCode?: string;
    productName: string;
    /** A component with variants is bundled as one specific variant. */
    variantId?: string;
    variantName?: string;
    quantity: number;
    bundlePrice: number;
}

/** Normalized {id,name} option shown in the target dropdown. */
export interface TargetOption {
    id: string;
    name: string;
}

// ── submit payload ──
export interface PromotionTargetPayload {
    targetType: string;
    targetId: string;
}

export interface PromotionBundleItemPayload {
    productId: string;
    variantId?: string;
    quantity: number;
    bundlePrice: number;
}

export interface PMM20000CreatePayload {
    promotionName: string;
    description?: string;
    promotionType: string;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    maxUse?: number;
    discountPercentage?: number;
    maxDiscountAmount?: number;
    discountPrice?: number;
    buyQuantity?: number;
    freeQuantity?: number;
    applicationType: string;
    targets: PromotionTargetPayload[];
    bundleItems: PromotionBundleItemPayload[];
}

// ── confirm-screen display ──
export interface PromotionDraftBundleLine {
    name: string;
    qty: number;
    price: number;
}

export interface PromotionDraftDisplay {
    name: string;
    type: string;
    reward: string;
    scope: string;
    targets: string[];
    bundle: PromotionDraftBundleLine[];
    period: string;
    isActive: boolean;
}

/** Draft stashed in ModuleFlowStore between PMM20000 → PMM30000 → PMM40000. */
export interface PromotionDraft {
    payload: PMM20000CreatePayload;
    display: PromotionDraftDisplay;
    idempotencyKey: string;
}

export interface PMM20000CreateResponse {
    promotionCode?: string;
}

/** Result stashed for the PMM40000 success screen. */
export interface PromotionResult {
    promotionCode?: string;
    name: string;
}
