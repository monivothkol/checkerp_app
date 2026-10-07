import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CRD10000Request, CRD10000Response, CreditPolicyRow } from "@/models/POS/CRD/CRD10000";

export default class RetrieveCreditPolicyList implements IRequest<CRD10000Request, CRD10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveCreditPolicyList;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveCreditPolicyList {
        if (!this.instance) { this.instance = new RetrieveCreditPolicyList(); }
        return this.instance;
    }
    public request(option: RequestOption<CRD10000Request, CRD10000Response>) {
        this.networkService.request({
            trCode: "CRD10000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess({ creditPolicyList: (r.creditPolicyList ?? []) as CreditPolicyRow[] }))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
