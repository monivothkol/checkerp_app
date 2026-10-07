import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PUR14000Response } from "@/models/POS/PUR/PUR14000";

export interface PUR14000Request { poId: string; }

export default class RetrievePurchaseOrderDetail implements IRequest<PUR14000Request, PUR14000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePurchaseOrderDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePurchaseOrderDetail {
        if (!this.instance) {
            this.instance = new RetrievePurchaseOrderDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<PUR14000Request, PUR14000Response>) {
        this.networkService.request({
            trCode: "PUR14000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PUR14000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
