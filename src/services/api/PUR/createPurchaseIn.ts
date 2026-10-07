import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PUR21000CreatePayload, PUR21000CreateResponse } from "@/models/POS/PUR/PUR21000";

export default class CreatePurchaseIn implements IRequest<PUR21000CreatePayload, PUR21000CreateResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreatePurchaseIn;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreatePurchaseIn {
        if (!this.instance) {
            this.instance = new CreatePurchaseIn();
        }
        return this.instance;
    }

    public request(option: RequestOption<PUR21000CreatePayload, PUR21000CreateResponse>) {
        this.networkService.request({
            trCode: "PUR21000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as PUR21000CreateResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
