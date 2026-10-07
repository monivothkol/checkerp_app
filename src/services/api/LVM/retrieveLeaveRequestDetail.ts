import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LVM14000Request, LVM14000Response } from "@/models/POS/LVM/LVM10000";

export default class RetrieveLeaveRequestDetail implements IRequest<LVM14000Request, LVM14000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveLeaveRequestDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveLeaveRequestDetail {
        if (!this.instance) {
            this.instance = new RetrieveLeaveRequestDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<LVM14000Request, LVM14000Response>) {
        this.networkService.request({
            trCode: "LVM14000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as LVM14000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
