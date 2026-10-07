import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LoanTermsRequest, SchedulePreviewResponse } from "@/models/POS/DBT/DBT20000";

/** DBT20000I02 — the repayment schedule a loan would get. */
export default class PreviewLoanSchedule
implements IRequest<LoanTermsRequest, SchedulePreviewResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: PreviewLoanSchedule;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): PreviewLoanSchedule {
        if (!this.instance) { this.instance = new PreviewLoanSchedule(); }
        return this.instance;
    }
    public request(option: RequestOption<LoanTermsRequest, SchedulePreviewResponse>) {
        this.networkService.request({
            trCode: "DBT20000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as SchedulePreviewResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
