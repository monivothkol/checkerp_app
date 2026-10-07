import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CUS34000Request, LoyaltyConditionRow } from "@/models/POS/CUS/CUS30000";

export default class RetrieveLoyaltyConditionDetail implements IRequest<CUS34000Request, LoyaltyConditionRow> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveLoyaltyConditionDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveLoyaltyConditionDetail {
        if (!this.instance) {
            this.instance = new RetrieveLoyaltyConditionDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<CUS34000Request, LoyaltyConditionRow>) {
        this.networkService.request({
            trCode: "CUS34000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as LoyaltyConditionRow);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
