import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { RecordRepaymentRequest, RecordRepaymentResponse } from "@/models/POS/DBT/DBT30000";

/** DBT30000I02 — record a repayment (posts principal + interest). */
export default class RecordLoanRepayment
implements IRequest<RecordRepaymentRequest, RecordRepaymentResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RecordLoanRepayment;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RecordLoanRepayment {
        if (!this.instance) { this.instance = new RecordLoanRepayment(); }
        return this.instance;
    }
    public request(option: RequestOption<RecordRepaymentRequest, RecordRepaymentResponse>) {
        this.networkService.request({
            trCode: "DBT30000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as RecordRepaymentResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
