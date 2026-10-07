import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PayrollRunActionRequest, PayrollRunActionResponse } from "@/models/POS/PRM/PRM14000";

/** PRM17000 — finalize a DRAFT run: post loan/advance repayments to the SFM ledger. */
export default class FinalizePayrollRun
implements IRequest<PayrollRunActionRequest, PayrollRunActionResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: FinalizePayrollRun;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): FinalizePayrollRun {
        if (!this.instance) { this.instance = new FinalizePayrollRun(); }
        return this.instance;
    }
    public request(option: RequestOption<PayrollRunActionRequest, PayrollRunActionResponse>) {
        this.networkService.request({
            trCode: "PRM14000I03", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as PayrollRunActionResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
