import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PurchaseReturnKeyRequest } from "./retrievePurchaseReturnDetail";
import type { PurchaseReturnDecisionResponse } from "@/models/POS/PUR/PUR30000";


export default class ApprovePurchaseReturn implements IRequest<PurchaseReturnKeyRequest, PurchaseReturnDecisionResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: ApprovePurchaseReturn;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): ApprovePurchaseReturn {
        if (!this.instance) {
            this.instance = new ApprovePurchaseReturn();
        }
        return this.instance;
    }

    public request(option: RequestOption<PurchaseReturnKeyRequest, PurchaseReturnDecisionResponse>) {
        this.networkService.request({
            trCode: "PUR30000I04",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PurchaseReturnDecisionResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
