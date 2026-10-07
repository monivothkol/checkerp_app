import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ApplicableCommissionsRequest, ApplicableCommissionsResponse } from "@/models/POS/PRM/PRM17000";

/** PRM17000I01 — APPROVED commissions with eligible unpaid recipients in a run. */
export default class RetrieveApplicableCommissions
implements IRequest<ApplicableCommissionsRequest, ApplicableCommissionsResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveApplicableCommissions;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveApplicableCommissions {
        if (!this.instance) { this.instance = new RetrieveApplicableCommissions(); }
        return this.instance;
    }
    public request(option: RequestOption<ApplicableCommissionsRequest, ApplicableCommissionsResponse>) {
        this.networkService.request({
            trCode: "PRM17000I01", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as ApplicableCommissionsResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
