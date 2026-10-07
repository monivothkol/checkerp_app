import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ApplyCommissionRequest, ApplyCommissionResponse } from "@/models/POS/PRM/PRM17000";

/** PRM17000I02 — apply one APPROVED commission's eligible recipients to a DRAFT run. */
export default class ApplyPayrollCommission
implements IRequest<ApplyCommissionRequest, ApplyCommissionResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: ApplyPayrollCommission;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): ApplyPayrollCommission {
        if (!this.instance) { this.instance = new ApplyPayrollCommission(); }
        return this.instance;
    }
    public request(option: RequestOption<ApplyCommissionRequest, ApplyCommissionResponse>) {
        this.networkService.request({
            trCode: "PRM17000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as ApplyCommissionResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
