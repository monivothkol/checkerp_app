import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ProductProfitResponse } from "@/models/POS/RPT/RPT40000";

export type CogsReportRequest = {
    pageNo?: number; pageSize?: number;
    dateFrom?: string; dateTo?: string;
    inventoryId?: string; categoryId?: string; brandId?: string;
    supplierId?: string; status?: string; paymentStatus?: string;
    searchKeyword?: string; asOfDate?: string;
};

/** RPT40000I01 - COGS report (cost side of product profitability). */
export default class RetrieveCogsReport implements IRequest<CogsReportRequest, ProductProfitResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveCogsReport;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveCogsReport {
        if (!this.instance) { this.instance = new RetrieveCogsReport(); }
        return this.instance;
    }
    public request(option: RequestOption<CogsReportRequest, ProductProfitResponse>) {
        this.networkService.request({
            trCode: "RPT40000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as ProductProfitResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
