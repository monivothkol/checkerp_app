import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CreditPolicySaveRequest, CreditPolicySaveResponse } from "@/models/POS/CRD/CRD10000";

export default class CreateCreditPolicy implements IRequest<CreditPolicySaveRequest, CreditPolicySaveResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateCreditPolicy;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): CreateCreditPolicy {
        if (!this.instance) { this.instance = new CreateCreditPolicy(); }
        return this.instance;
    }
    public request(option: RequestOption<CreditPolicySaveRequest, CreditPolicySaveResponse>) {
        this.networkService.request({
            trCode: "CRD11000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as CreditPolicySaveResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
