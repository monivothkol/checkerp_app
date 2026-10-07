import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CreditPolicySaveRequest, CreditPolicySaveResponse } from "@/models/POS/CRD/CRD10000";

export default class UpdateCreditPolicy implements IRequest<CreditPolicySaveRequest, CreditPolicySaveResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateCreditPolicy;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): UpdateCreditPolicy {
        if (!this.instance) { this.instance = new UpdateCreditPolicy(); }
        return this.instance;
    }
    public request(option: RequestOption<CreditPolicySaveRequest, CreditPolicySaveResponse>) {
        this.networkService.request({
            trCode: "CRD10000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CreditPolicySaveResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
