import type { AssetRow, DepreciationMethod, PaidFrom } from "@/models/POS/AST/AST10000";

/** AST30000 — asset detail with its depreciation history. */
export interface DepreciationRow {
    depreciationId: string;
    periodMonth: string;
    amount: number | string;
    bookValueAfter: number | string;
    postedAt?: string;
}

export interface AssetDetailResponse extends AssetRow {
    depreciationList: DepreciationRow[];
}

export interface UpdateAssetRequest {
    assetId: string;
    assetName: string;
    salvageValue?: number;
    usefulLifeMonths?: number;
    depreciationMethod?: DepreciationMethod;
    serialNo?: string;
    location?: string;
    supplierName?: string;
    remark?: string;
}

export interface UpdateAssetResponse {
    assetId: string;
}

export interface DisposeAssetRequest {
    assetId: string;
    disposalDate: string;
    disposalAmount: number;
    receivedTo?: PaidFrom;
}

export interface DisposeAssetResponse {
    assetId: string;
    gainLoss: number | string;
}
