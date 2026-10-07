import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PurchaseOrderTransitionResponse } from "@/models/POS/PUR/PUR14000";

export interface CancelPurchaseOrderRequest {
    poId: string;
    /** Optional note stored as the PO cancel reason. */
    reason?: string;
}

export default class CancelPurchaseOrder implements IRequest<CancelPurchaseOrderRequest, PurchaseOrderTransitionResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CancelPurchaseOrder;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CancelPurchaseOrder {
        if (!this.instance) {
            this.instance = new CancelPurchaseOrder();
        }
        return this.instance;
    }

    public request(option: RequestOption<CancelPurchaseOrderRequest, PurchaseOrderTransitionResponse>) {
        this.networkService.request({
            trCode: "PUR14000I04",
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
