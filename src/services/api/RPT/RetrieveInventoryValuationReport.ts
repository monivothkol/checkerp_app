import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { InventoryValuationResponse } from "@/models/POS/RPT/RPT20000";

export type InventoryValuationRequest = {
    pageNo?: number; pageSize?: number;
    dateFrom?: string; dateTo?: string;
    inventoryId?: string; categoryId?: string; brandId?: string;
    supplierId?: string; status?: string; paymentStatus?: string;
    searchKeyword?: string; asOfDate?: string;
};

/** RPT20000I01 - inventory valuation (stock value) report. */
export default class RetrieveInventoryValuationReport implements IRequest<InventoryValuationRequest, InventoryValuationResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveInventoryValuationReport;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveInventoryValuationReport {
        if (!this.instance) { this.instance = new RetrieveInventoryValuationReport(); }
        return this.instance;
    }
    public request(option: RequestOption<InventoryValuationRequest, InventoryValuationResponse>) {
        this.networkService.request({
            trCode: "RPT20000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as InventoryValuationResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
