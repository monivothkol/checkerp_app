import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CUS30000Request, CUS30000Response, LoyaltyConditionRow } from "@/models/POS/CUS/CUS30000";

export default class RetrieveLoyaltyConditionList implements IRequest<CUS30000Request, CUS30000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveLoyaltyConditionList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveLoyaltyConditionList {
        if (!this.instance) {
            this.instance = new RetrieveLoyaltyConditionList();
        }
        return this.instance;
    }

    public request(option: RequestOption<CUS30000Request, CUS30000Response>) {
        this.networkService.request({
            trCode: "CUS30000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: CUS30000Response = {
                totalCount: response.totalCount ?? 0,
                conditionList: (response.conditionList ?? []) as LoyaltyConditionRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
