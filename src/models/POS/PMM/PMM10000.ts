/** Promotion list — PMM10000. */

export type PromotionType =
    | "PERCENTAGE_DISCOUNT"
    | "BUY_X_GET_Y"
    | "BUNDLED_PACKAGE"
    | "PRICE_OVERRIDE";

export interface PromotionRow {
    promotionId?: string;
    promotionCode: string;
    promotionName: string;
    promotionType: PromotionType;
    discountPercentage?: number;
    discountPrice?: number;
    buyQuantity?: number;
    freeQuantity?: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
}

export interface PMM10000Request {
    searchKeyword?: string;
    promotionType?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface PMM10000Response {
    totalCount: number;
    promotionList: PromotionRow[];
}
