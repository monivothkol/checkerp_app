import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ActLeaveRequest, ActLeaveResponse } from "@/models/POS/LVM/LVM10000";

/** LVM14000I03 — reject a PENDING leave request (rejects the whole line). */
export default class RejectLeaveRequest
implements IRequest<ActLeaveRequest, ActLeaveResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RejectLeaveRequest;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RejectLeaveRequest {
        if (!this.instance) { this.instance = new RejectLeaveRequest(); }
        return this.instance;
    }
    public request(option: RequestOption<ActLeaveRequest, ActLeaveResponse>) {
        this.networkService.request({
            trCode: "LVM14000I03", reqBody: option.dataBody, enableLoading: option.enableLoading,
            stateProps: option.stateProps, loadingBtn: option.loadingBtn, headers: option.headers
        }).then((r) => option.listener?.onSuccess(r as ActLeaveResponse))
          .catch((e) => option.listener?.onFail?.(e));
    }
}
