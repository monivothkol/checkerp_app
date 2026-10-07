import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PurchaseReturnDetail } from "@/models/POS/PUR/PUR30000";

export interface PurchaseReturnKeyRequest {
    adjustmentId: string;
}

export default class RetrievePurchaseReturnDetail implements IRequest<PurchaseReturnKeyRequest, PurchaseReturnDetail> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePurchaseReturnDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePurchaseReturnDetail {
        if (!this.instance) {
            this.instance = new RetrievePurchaseReturnDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<PurchaseReturnKeyRequest, PurchaseReturnDetail>) {
        this.networkService.request({
            trCode: "PUR30000I03",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PurchaseReturnDetail);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
