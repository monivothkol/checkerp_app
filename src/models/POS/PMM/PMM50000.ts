/** Promotion detail — PMM50000 (promotion header + targets[] + bundleItems[]). */

import type { PromotionType } from "./PMM10000";

export interface PromotionDetailTarget {
    targetType: string;
    targetId: string;
    targetName?: string;
}

export interface PromotionDetailBundleItem {
    productId: string;
    productCode?: string;
    productName: string;
    quantity: number;
    bundlePrice: number;
}

export interface PMM50000Response {
    promotionId?: string;
    promotionCode: string;
    promotionName: string;
    promotionType: PromotionType;
    description?: string;
    discountPercentage?: number;
    maxDiscountAmount?: number;
    discountPrice?: number;
    buyQuantity?: number;
    freeQuantity?: number;
    startDate?: string;
    endDate?: string;
    maxUse?: number;
    isActive: boolean;
    targets?: PromotionDetailTarget[];
    bundleItems?: PromotionDetailBundleItem[];
}
