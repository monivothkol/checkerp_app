import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LVM20000Response, LeaveType } from "@/models/POS/LVM/LVM20000";

export default class RetrieveLeaveTypeList implements IRequest<Record<string, unknown>, LVM20000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveLeaveTypeList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveLeaveTypeList {
        if (!this.instance) {
            this.instance = new RetrieveLeaveTypeList();
        }
        return this.instance;
    }

    public request(option: RequestOption<Record<string, unknown>, LVM20000Response>) {
        this.networkService.request({
            trCode: "LVM20000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: LVM20000Response = {
                typeList: (response.typeList ?? []) as LeaveType[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
