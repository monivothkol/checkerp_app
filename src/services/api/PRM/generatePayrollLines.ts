import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PayrollRunActionRequest, PayrollRunActionResponse } from "@/models/POS/PRM/PRM14000";

/** PRM14000I02 — rebuild every engine line (attendance/leave/recovery/adjustments) on a DRAFT run. */
export default class GeneratePayrollLines
implements IRequest<PayrollRunActionRequest, PayrollRunActionResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: GeneratePayrollLines;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): GeneratePayrollLines {
        if (!this.instance) { this.instance = new GeneratePayrollLines(); }
        return this.instance;
    }
    public request(option: RequestOption<PayrollRunActionRequest, PayrollRunActionResponse>) {
        this.networkService.request({
            trCode: "PRM14000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as PayrollRunActionResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
