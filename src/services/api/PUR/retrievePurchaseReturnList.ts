import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PUR30000Response } from "@/models/POS/PUR/PUR30000";

export interface PurchaseReturnListRequest {
    searchKeyword?: string;
    status?: string;
    pageNo: number;
    pageSize: number;
}

export default class RetrievePurchaseReturnList implements IRequest<PurchaseReturnListRequest, PUR30000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePurchaseReturnList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePurchaseReturnList {
        if (!this.instance) {
            this.instance = new RetrievePurchaseReturnList();
        }
        return this.instance;
    }

    public request(option: RequestOption<PurchaseReturnListRequest, PUR30000Response>) {
        this.networkService.request({
            trCode: "PUR30000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PUR30000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
