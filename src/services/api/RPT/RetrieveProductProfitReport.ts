import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ProductProfitResponse } from "@/models/POS/RPT/RPT40000";

export type ProductProfitRequest = {
    pageNo?: number; pageSize?: number;
    dateFrom?: string; dateTo?: string;
    inventoryId?: string; categoryId?: string; brandId?: string;
    supplierId?: string; status?: string; paymentStatus?: string;
    searchKeyword?: string; asOfDate?: string;
};

/** RPT50000I01 - product gross profit (P&L) report. */
export default class RetrieveProductProfitReport implements IRequest<ProductProfitRequest, ProductProfitResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveProductProfitReport;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveProductProfitReport {
        if (!this.instance) { this.instance = new RetrieveProductProfitReport(); }
        return this.instance;
    }
    public request(option: RequestOption<ProductProfitRequest, ProductProfitResponse>) {
        this.networkService.request({
            trCode: "RPT50000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as ProductProfitResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
