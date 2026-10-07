import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface CUS36000Request {
    conditionId: string;
}

export interface CUS36000Response {
    deleted?: boolean;
}

export default class DeleteLoyaltyCondition implements IRequest<CUS36000Request, CUS36000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: DeleteLoyaltyCondition;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): DeleteLoyaltyCondition {
        if (!this.instance) {
            this.instance = new DeleteLoyaltyCondition();
        }
        return this.instance;
    }

    public request(option: RequestOption<CUS36000Request, CUS36000Response>) {
        this.networkService.request({
            trCode: "CUS30000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as CUS36000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
