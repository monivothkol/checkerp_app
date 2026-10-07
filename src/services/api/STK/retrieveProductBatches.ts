import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface ProductBatch {
    batchId?: string;
    batchNo?: string;
    expiryDate?: string;
    receivedAt?: string;
    quantityReceived?: number;
    quantityRemaining?: number;
    unitCost?: number;
    status?: string;
    inventoryName?: string;
    daysToExpiry?: number;
}

export interface ProductBatchesRequest {
    productCode: string;
    inventoryId?: string;
}

export interface ProductBatchesResponse {
    batchList: ProductBatch[];
}

export default class RetrieveProductBatches implements IRequest<ProductBatchesRequest, ProductBatchesResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveProductBatches;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveProductBatches {
        if (!this.instance) { this.instance = new RetrieveProductBatches(); }
        return this.instance;
    }
    public request(option: RequestOption<ProductBatchesRequest, ProductBatchesResponse>) {
        this.networkService.request({
            trCode: "STK13000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess({ batchList: (response.batchList ?? []) as ProductBatch[] });
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
