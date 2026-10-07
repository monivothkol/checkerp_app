import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LeaveTypeIdRequest, LeaveTypeActiveResponse } from "@/models/POS/LVM/LVM20000";

/** LVM20000I04 - soft-delete (deactivate) a leave type. */
export default class DeleteLeaveType implements IRequest<LeaveTypeIdRequest, LeaveTypeActiveResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: DeleteLeaveType;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): DeleteLeaveType {
        if (!this.instance) {
            this.instance = new DeleteLeaveType();
        }
        return this.instance;
    }

    public request(option: RequestOption<LeaveTypeIdRequest, LeaveTypeActiveResponse>) {
        this.networkService.request({
            trCode: "LVM20000I04",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as LeaveTypeActiveResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
