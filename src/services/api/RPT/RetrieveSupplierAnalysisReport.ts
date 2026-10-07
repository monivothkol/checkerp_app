import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SupplierAnalysisResponse } from "@/models/POS/RPT/RPT91000";

export type SupplierAnalysisRequest = {
    pageNo?: number; pageSize?: number;
    dateFrom?: string; dateTo?: string;
    inventoryId?: string; categoryId?: string; brandId?: string;
    supplierId?: string; status?: string; paymentStatus?: string;
    searchKeyword?: string; asOfDate?: string;
};

/** RPT91000I01 - supplier analysis scoreboard. */
export default class RetrieveSupplierAnalysisReport implements IRequest<SupplierAnalysisRequest, SupplierAnalysisResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSupplierAnalysisReport;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveSupplierAnalysisReport {
        if (!this.instance) { this.instance = new RetrieveSupplierAnalysisReport(); }
        return this.instance;
    }
    public request(option: RequestOption<SupplierAnalysisRequest, SupplierAnalysisResponse>) {
        this.networkService.request({
            trCode: "RPT91000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as SupplierAnalysisResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
