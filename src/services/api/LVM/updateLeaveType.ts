import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LeaveTypeUpdateRequest } from "@/models/POS/LVM/LVM20000";

/** LVM20000I03 - update an existing leave type. */
export default class UpdateLeaveType implements IRequest<LeaveTypeUpdateRequest, Record<string, unknown>> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateLeaveType;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): UpdateLeaveType {
        if (!this.instance) {
            this.instance = new UpdateLeaveType();
        }
        return this.instance;
    }

    public request(option: RequestOption<LeaveTypeUpdateRequest, Record<string, unknown>>) {
        this.networkService.request({
            trCode: "LVM20000I03",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as Record<string, unknown>);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
