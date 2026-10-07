import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PMM10000Request, PMM10000Response, PromotionRow } from "@/models/POS/PMM/PMM10000";

export default class RetrievePromotionList implements IRequest<PMM10000Request, PMM10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePromotionList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePromotionList {
        if (!this.instance) {
            this.instance = new RetrievePromotionList();
        }
        return this.instance;
    }

    public request(option: RequestOption<PMM10000Request, PMM10000Response>) {
        this.networkService.request({
            trCode: "PMM10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: PMM10000Response = {
                totalCount: response.totalCount ?? 0,
                promotionList: (response.promotionList ?? []) as PromotionRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
