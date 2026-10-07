import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { BalanceStatementResponse } from "@/models/ACT/ACT35000";

export type BalanceStatementRequest = {
    pageNo?: number; pageSize?: number;
    dateFrom?: string; dateTo?: string;
    inventoryId?: string; categoryId?: string; brandId?: string;
    supplierId?: string; status?: string; paymentStatus?: string;
    searchKeyword?: string; asOfDate?: string;
};

/** ACT35000I01 - balance statement snapshot (assets / liabilities / equity). */
export default class RetrieveBalanceStatement implements IRequest<BalanceStatementRequest, BalanceStatementResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveBalanceStatement;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveBalanceStatement {
        if (!this.instance) { this.instance = new RetrieveBalanceStatement(); }
        return this.instance;
    }
    public request(option: RequestOption<BalanceStatementRequest, BalanceStatementResponse>) {
        this.networkService.request({
            trCode: "ACT35000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as BalanceStatementResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
