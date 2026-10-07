import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PRM21000CreatePayload, PRM21000CreateResponse } from "@/models/POS/PRM/PRM21000";

export default class CreateAdjustment implements IRequest<PRM21000CreatePayload, PRM21000CreateResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateAdjustment;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreateAdjustment {
        if (!this.instance) {
            this.instance = new CreateAdjustment();
        }
        return this.instance;
    }

    public request(option: RequestOption<PRM21000CreatePayload, PRM21000CreateResponse>) {
        this.networkService.request({
            trCode: "PRM21000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as PRM21000CreateResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
