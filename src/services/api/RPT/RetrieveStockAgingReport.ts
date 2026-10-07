import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { StockAgingReportResponse } from "@/models/POS/RPT/RPT10000";

export type StockAgingReportRequest = {
    pageNo?: number; pageSize?: number;
    dateFrom?: string; dateTo?: string;
    inventoryId?: string; categoryId?: string; brandId?: string;
    supplierId?: string; status?: string; paymentStatus?: string;
    searchKeyword?: string; asOfDate?: string;
};

/** RPT10000I01 - stock aging report (buckets + paged items). */
export default class RetrieveStockAgingReport implements IRequest<StockAgingReportRequest, StockAgingReportResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveStockAgingReport;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveStockAgingReport {
        if (!this.instance) { this.instance = new RetrieveStockAgingReport(); }
        return this.instance;
    }
    public request(option: RequestOption<StockAgingReportRequest, StockAgingReportResponse>) {
        this.networkService.request({
            trCode: "RPT10000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as StockAgingReportResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
