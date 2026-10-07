import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PurchaseOrderTransitionResponse } from "@/models/POS/PUR/PUR14000";

export interface ApprovePurchaseOrderRequest {
    poId: string;
}

export default class ApprovePurchaseOrder implements IRequest<ApprovePurchaseOrderRequest, PurchaseOrderTransitionResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: ApprovePurchaseOrder;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): ApprovePurchaseOrder {
        if (!this.instance) {
            this.instance = new ApprovePurchaseOrder();
        }
        return this.instance;
    }

    public request(option: RequestOption<ApprovePurchaseOrderRequest, PurchaseOrderTransitionResponse>) {
        this.networkService.request({
            trCode: "PUR14000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PurchaseOrderTransitionResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
