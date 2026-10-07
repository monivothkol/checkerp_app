import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CreditExposureResponse } from "@/models/POS/RPT/RPT70000";

export type CreditExposureRequest = {
    pageNo?: number; pageSize?: number;
    dateFrom?: string; dateTo?: string;
    inventoryId?: string; categoryId?: string; brandId?: string;
    supplierId?: string; status?: string; paymentStatus?: string;
    searchKeyword?: string; asOfDate?: string;
};

/** RPT70000I01 - per-customer credit exposure report. */
export default class RetrieveCreditExposureReport implements IRequest<CreditExposureRequest, CreditExposureResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveCreditExposureReport;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveCreditExposureReport {
        if (!this.instance) { this.instance = new RetrieveCreditExposureReport(); }
        return this.instance;
    }
    public request(option: RequestOption<CreditExposureRequest, CreditExposureResponse>) {
        this.networkService.request({
            trCode: "RPT70000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CreditExposureResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
