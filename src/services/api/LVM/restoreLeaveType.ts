import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LeaveTypeIdRequest, LeaveTypeActiveResponse } from "@/models/POS/LVM/LVM20000";

/** LVM20000I05 - restore a soft-deleted leave type. */
export default class RestoreLeaveType implements IRequest<LeaveTypeIdRequest, LeaveTypeActiveResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RestoreLeaveType;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RestoreLeaveType {
        if (!this.instance) {
            this.instance = new RestoreLeaveType();
        }
        return this.instance;
    }

    public request(option: RequestOption<LeaveTypeIdRequest, LeaveTypeActiveResponse>) {
        this.networkService.request({
            trCode: "LVM20000I05",
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
