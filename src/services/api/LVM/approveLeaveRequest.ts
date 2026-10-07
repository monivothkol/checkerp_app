import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ActLeaveRequest, ActLeaveResponse } from "@/models/POS/LVM/LVM10000";

/** LVM14000I02 — approve the current step of a PENDING leave request. */
export default class ApproveLeaveRequest
implements IRequest<ActLeaveRequest, ActLeaveResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: ApproveLeaveRequest;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): ApproveLeaveRequest {
        if (!this.instance) { this.instance = new ApproveLeaveRequest(); }
        return this.instance;
    }
    public request(option: RequestOption<ActLeaveRequest, ActLeaveResponse>) {
        this.networkService.request({
            trCode: "LVM14000I02", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as ActLeaveResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
