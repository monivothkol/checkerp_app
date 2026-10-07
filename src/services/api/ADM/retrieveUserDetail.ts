import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ADM14000Response } from "@/models/POS/ADM/ADM14000";

export interface ADM14000Request {
    targetUserId: string;
}

export default class RetrieveUserDetail implements IRequest<ADM14000Request, ADM14000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveUserDetail;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveUserDetail {
        if (!this.instance) { this.instance = new RetrieveUserDetail(); }
        return this.instance;
    }
    public request(option: RequestOption<ADM14000Request, ADM14000Response>) {
        this.networkService.request({
            trCode: "ADM14000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as ADM14000Response);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
