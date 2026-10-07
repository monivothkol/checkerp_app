import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export type ProductHistoryType = "sale" | "quotation" | "purchase" | "transfer" | "adjustment" | "movement";

/** One history row. Fields are a union across tab types; only the relevant ones are set per type. */
export interface ProductHistoryRow {
    recordId?: string;
    code?: string;
    date?: string;
    partyName?: string;
    inventoryName?: string;
    fromInventoryName?: string;
    toInventoryName?: string;
    reason?: string;
    status?: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
    quantityBefore?: number;
    quantityAfter?: number;
    quantityDifference?: number;
    // movement tab (reuses STK40000 union)
    movementDate?: string;
    movementType?: string;
    referenceCode?: string;
    quantityChange?: number;
}

export interface ProductHistoryRequest {
    productId: string;
    type: ProductHistoryType;
    pageNo: number;
    pageSize: number;
    inventoryId?: string;
}

export interface ProductHistoryResponse {
    totalCount: number;
    list: ProductHistoryRow[];
}

export default class RetrieveProductHistory implements IRequest<ProductHistoryRequest, ProductHistoryResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveProductHistory;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveProductHistory {
        if (!this.instance) { this.instance = new RetrieveProductHistory(); }
        return this.instance;
    }
    public request(option: RequestOption<ProductHistoryRequest, ProductHistoryResponse>) {
        this.networkService.request({
            trCode: "PRD50000I03",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as ProductHistoryResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
