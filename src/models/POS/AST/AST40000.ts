/** AST40000 — monthly depreciation run. */
export interface DepreciationDueRow {
    assetId: string;
    assetCode: string;
    assetName: string;
    assetType: string;
    cost: number | string;
    salvageValue: number | string;
    usefulLifeMonths: number;
    depreciationMethod: string;
    accumulatedDepreciation: number | string;
    amount: number | string;
    bookValueAfter: number | string;
}

export interface DepreciationRunRequest {
    periodMonth?: string;
}

export interface DepreciationPreviewResponse {
    periodMonth: string;
    assetList: DepreciationDueRow[];
    count: number;
    totalAmount: number | string;
}

export interface DepreciationPostResponse {
    periodMonth: string;
    posted: number;
    totalAmount: number | string;
}
