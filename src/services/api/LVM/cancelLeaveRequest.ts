import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CancelLeaveRequest, CancelLeaveResponse } from "@/models/POS/LVM/LVM10000";

/** LVM14000I04 - cancel a PENDING leave request. */
export default class CancelLeaveRequestApi implements IRequest<CancelLeaveRequest, CancelLeaveResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CancelLeaveRequestApi;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CancelLeaveRequestApi {
        if (!this.instance) {
            this.instance = new CancelLeaveRequestApi();
        }
        return this.instance;
    }

    public request(option: RequestOption<CancelLeaveRequest, CancelLeaveResponse>) {
        this.networkService.request({
            trCode: "LVM14000I04",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as CancelLeaveResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
