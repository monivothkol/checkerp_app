import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PUR24000Response } from "@/models/POS/PUR/PUR24000";

export interface PUR24000Request { adjustmentId: string; }

export default class RetrievePurchaseInDetail implements IRequest<PUR24000Request, PUR24000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePurchaseInDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePurchaseInDetail {
        if (!this.instance) {
            this.instance = new RetrievePurchaseInDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<PUR24000Request, PUR24000Response>) {
        this.networkService.request({
            trCode: "PUR24000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PUR24000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
