import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CUS35000Request } from "@/models/POS/CUS/CUS30000";

export default class UpdateLoyaltyCondition implements IRequest<CUS35000Request, Record<string, unknown>> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateLoyaltyCondition;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): UpdateLoyaltyCondition {
        if (!this.instance) {
            this.instance = new UpdateLoyaltyCondition();
        }
        return this.instance;
    }

    public request(option: RequestOption<CUS35000Request, Record<string, unknown>>) {
        this.networkService.request({
            trCode: "CUS34000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as Record<string, unknown>);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
