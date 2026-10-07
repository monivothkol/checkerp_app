import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PurchaseReturnCreateItem, PurchaseReturnCreateResponse } from "@/models/POS/PUR/PUR30000";

export interface PurchaseReturnCreateRequest {
    supplierId: string;
    inventoryId: string;
    /** Refund received from the supplier; backend defaults it to full price. */
    paidAmount?: number;
    notes?: string;
    itemList: PurchaseReturnCreateItem[];
}

export default class CreatePurchaseReturn implements IRequest<PurchaseReturnCreateRequest, PurchaseReturnCreateResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreatePurchaseReturn;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreatePurchaseReturn {
        if (!this.instance) {
            this.instance = new CreatePurchaseReturn();
        }
        return this.instance;
    }

    public request(option: RequestOption<PurchaseReturnCreateRequest, PurchaseReturnCreateResponse>) {
        this.networkService.request({
            trCode: "PUR30000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PurchaseReturnCreateResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
