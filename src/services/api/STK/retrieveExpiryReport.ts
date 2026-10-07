import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ProductBatch } from "@/services/api/STK/retrieveProductBatches";

export interface ExpiryReportRequest {
    withinDays?: number;
    expiredOnly?: boolean;
    inventoryId?: string;
    pageNo?: number;
    pageSize?: number;
}

export interface ExpiryReportResponse {
    totalCount: number;
    batchList: ProductBatch[];
}

export default class RetrieveExpiryReport implements IRequest<ExpiryReportRequest, ExpiryReportResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveExpiryReport;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveExpiryReport {
        if (!this.instance) { this.instance = new RetrieveExpiryReport(); }
        return this.instance;
    }
    public request(option: RequestOption<ExpiryReportRequest, ExpiryReportResponse>) {
        this.networkService.request({
            trCode: "STK50000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess({
                totalCount: response.totalCount ?? 0,
                batchList: (response.batchList ?? []) as ProductBatch[]
            });
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
