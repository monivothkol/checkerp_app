import type { AssetType, DepreciationMethod, PaidFrom } from "@/models/POS/AST/AST10000";

/** AST20000 — record an asset. */
export interface CreateAssetRequest {
    assetName: string;
    assetType: AssetType;
    cost: number;
    purchaseDate: string;
    salvageValue?: number;
    usefulLifeMonths?: number;
    depreciationMethod?: DepreciationMethod;
    depreciationStart?: string;
    accountCode?: string;
    paidFrom?: PaidFrom;
    serialNo?: string;
    location?: string;
    supplierName?: string;
    remark?: string;
}

export interface CreateAssetResponse {
    assetId: string;
    assetCode: string;
}
