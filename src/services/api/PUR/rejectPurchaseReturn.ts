import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PurchaseReturnKeyRequest } from "./retrievePurchaseReturnDetail";
import type { PurchaseReturnDecisionResponse } from "@/models/POS/PUR/PUR30000";


export default class RejectPurchaseReturn implements IRequest<PurchaseReturnKeyRequest, PurchaseReturnDecisionResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RejectPurchaseReturn;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RejectPurchaseReturn {
        if (!this.instance) {
            this.instance = new RejectPurchaseReturn();
        }
        return this.instance;
    }

    public request(option: RequestOption<PurchaseReturnKeyRequest, PurchaseReturnDecisionResponse>) {
        this.networkService.request({
            trCode: "PUR30000I05",
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
