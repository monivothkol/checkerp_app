import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PMM20000CreatePayload, PMM20000CreateResponse } from "@/models/POS/PMM/PMM20000";

export default class CreatePromotion implements IRequest<PMM20000CreatePayload, PMM20000CreateResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreatePromotion;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreatePromotion {
        if (!this.instance) {
            this.instance = new CreatePromotion();
        }
        return this.instance;
    }

    public request(option: RequestOption<PMM20000CreatePayload, PMM20000CreateResponse>) {
        this.networkService.request({
            trCode: "PMM20000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as PMM20000CreateResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
