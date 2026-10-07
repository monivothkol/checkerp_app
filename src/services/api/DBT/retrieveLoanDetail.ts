import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LoanDetailResponse } from "@/models/POS/DBT/DBT30000";

/** DBT30000I01 — one loan with its schedule and payments. */
export default class RetrieveLoanDetail
implements IRequest<{ loanId: string }, LoanDetailResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveLoanDetail;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveLoanDetail {
        if (!this.instance) { this.instance = new RetrieveLoanDetail(); }
        return this.instance;
    }
    public request(option: RequestOption<{ loanId: string }, LoanDetailResponse>) {
        this.networkService.request({
            trCode: "DBT30000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as LoanDetailResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
