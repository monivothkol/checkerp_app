import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { DBT10000Response, LenderType, LoanStatus } from "@/models/POS/DBT/DBT10000";

export interface RetrieveLoanListRequest {
    pageNo?: number;
    pageSize?: number;
    searchKeyword?: string;
    lenderType?: LenderType;
    status?: LoanStatus;
}

/** DBT10000I01 — loan list with filters + totals (outstanding, current, long-term). */
export default class RetrieveLoanList
implements IRequest<RetrieveLoanListRequest, DBT10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveLoanList;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveLoanList {
        if (!this.instance) { this.instance = new RetrieveLoanList(); }
        return this.instance;
    }
    public request(option: RequestOption<RetrieveLoanListRequest, DBT10000Response>) {
        this.networkService.request({
            trCode: "DBT10000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as DBT10000Response))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
