import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PurchaseReportResponse } from "@/models/POS/RPT/RPT90000";

export type PurchaseReportRequest = {
    pageNo?: number; pageSize?: number;
    dateFrom?: string; dateTo?: string;
    inventoryId?: string; categoryId?: string; brandId?: string;
    supplierId?: string; status?: string; paymentStatus?: string;
    searchKeyword?: string; asOfDate?: string;
};

/** RPT90000I01 - purchase report (goods receipts + summary). */
export default class RetrievePurchaseReport implements IRequest<PurchaseReportRequest, PurchaseReportResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePurchaseReport;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrievePurchaseReport {
        if (!this.instance) { this.instance = new RetrievePurchaseReport(); }
        return this.instance;
    }
    public request(option: RequestOption<PurchaseReportRequest, PurchaseReportResponse>) {
        this.networkService.request({
            trCode: "RPT90000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as PurchaseReportResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
