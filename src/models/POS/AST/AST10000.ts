/** Asset register row — AST10000. */
export type AssetClass = "CURRENT" | "NON_CURRENT";
export type AssetStatus = "ACTIVE" | "DISPOSED";
export type DepreciationMethod = "NONE" | "STRAIGHT_LINE" | "DECLINING_150" | "DECLINING_200";
export type PaidFrom = "CASH" | "BANK" | "CREDIT";

export const ASSET_TYPES = ["EQUIPMENT", "FURNITURE", "VEHICLE", "BUILDING", "LAND", "INTANGIBLE", "DEPOSIT", "INVESTMENT", "PREPAID"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];
/** Types the backend depreciates (mirrors AssetType.depreciable on the server). */
export const DEPRECIABLE_TYPES: readonly AssetType[] = ["EQUIPMENT", "FURNITURE", "VEHICLE", "BUILDING", "INTANGIBLE"];

export interface AssetRow {
    assetId: string;
    assetCode: string;
    assetName: string;
    assetType: AssetType;
    assetClass: AssetClass;
    accountCode: string;
    purchaseDate: string;
    cost: number | string;
    salvageValue: number | string;
    usefulLifeMonths: number;
    depreciationMethod: DepreciationMethod;
    depreciationStart?: string;
    accumulatedDepreciation: number | string;
    netBookValue: number | string;
    paidFrom: PaidFrom;
    status: AssetStatus;
    disposedAt?: string;
    disposalAmount?: number | string;
    disposalGainLoss?: number | string;
    serialNo?: string;
    location?: string;
    supplierName?: string;
    remark?: string;
    createdAt?: string;
}

export interface AssetTotals {
    cost: number | string;
    accumulatedDepreciation: number | string;
    netBookValue: number | string;
}

export interface AST10000Response {
    totalCount: number;
    assetList: AssetRow[];
    totals?: AssetTotals;
}

/** AST10000I02 — the assets computed from other modules (cash, receivables, inventory). */
export interface ComputedAssetsResponse {
    reportDate?: string;
    cash?: number | string;
    accountsReceivable?: number | string;
    inventoryValue?: number | string;
    otherCurrentAssets?: number | string;
    fixedAssets?: number | string;
    totalCurrentAssets?: number | string;
    totalAssets?: number | string;
}
