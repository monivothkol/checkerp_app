import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PUR11000CreatePayload, PUR11000CreateResponse } from "@/models/POS/PUR/PUR11000";

export default class CreatePurchaseOrder implements IRequest<PUR11000CreatePayload, PUR11000CreateResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreatePurchaseOrder;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreatePurchaseOrder {
        if (!this.instance) {
            this.instance = new CreatePurchaseOrder();
        }
        return this.instance;
    }

    public request(option: RequestOption<PUR11000CreatePayload, PUR11000CreateResponse>) {
        this.networkService.request({
            trCode: "PUR11000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as PUR11000CreateResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
