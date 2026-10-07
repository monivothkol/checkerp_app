import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CUS31000Request, CUS31000Response } from "@/models/POS/CUS/CUS30000";

export default class CreateLoyaltyCondition implements IRequest<CUS31000Request, CUS31000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateLoyaltyCondition;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreateLoyaltyCondition {
        if (!this.instance) {
            this.instance = new CreateLoyaltyCondition();
        }
        return this.instance;
    }

    public request(option: RequestOption<CUS31000Request, CUS31000Response>) {
        this.networkService.request({
            trCode: "CUS31000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as CUS31000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
