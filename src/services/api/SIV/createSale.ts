import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SIV11000CreatePayload, SIV11000CreateResponse } from "@/models/POS/SIV/SIV11000";

export default class CreateSale implements IRequest<SIV11000CreatePayload, SIV11000CreateResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateSale;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreateSale {
        if (!this.instance) {
            this.instance = new CreateSale();
        }
        return this.instance;
    }

    public request(option: RequestOption<SIV11000CreatePayload, SIV11000CreateResponse>) {
        this.networkService.request({
            trCode: "SIV11000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as SIV11000CreateResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
