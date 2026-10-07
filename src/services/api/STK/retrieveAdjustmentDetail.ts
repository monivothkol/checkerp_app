import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { STK33000Response } from "@/models/POS/STK/STK33000";

export interface STK33000Request { adjustmentCode: string; }

export default class RetrieveAdjustmentDetail implements IRequest<STK33000Request, STK33000Response> {
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

    public request(option: RequestOption<STK33000Request, STK33000Response>) {
        this.networkService.request({
            trCode: "STK33000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as STK33000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
