import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PRM24000Response } from "@/models/POS/PRM/PRM21000";

export interface PRM24000Request {
    adjustmentId: string;
}

export default class RetrieveAdjustmentDetail implements IRequest<PRM24000Request, PRM24000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveAdjustmentDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveAdjustmentDetail {
        if (!this.instance) {
            this.instance = new RetrieveAdjustmentDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<PRM24000Request, PRM24000Response>) {
        this.networkService.request({
            trCode: "PRM24000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PRM24000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
