import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LVM10000Request, LVM10000Response, LeaveRequestRow } from "@/models/POS/LVM/LVM10000";

export default class RetrieveLeaveRequestList implements IRequest<LVM10000Request, LVM10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveLeaveRequestList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveLeaveRequestList {
        if (!this.instance) {
            this.instance = new RetrieveLeaveRequestList();
        }
        return this.instance;
    }

    public request(option: RequestOption<LVM10000Request, LVM10000Response>) {
        this.networkService.request({
            trCode: "LVM10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: LVM10000Response = {
                totalCount: response.totalCount ?? 0,
                requestList: (response.requestList ?? []) as LeaveRequestRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
