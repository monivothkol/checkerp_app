import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { CUS40000Request, CUS40000Response, PriceGroupRow } from "@/models/POS/CUS/CUS40000";

export default class RetrievePriceGroupList implements IRequest<CUS40000Request, CUS40000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePriceGroupList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePriceGroupList {
        if (!this.instance) {
            this.instance = new RetrievePriceGroupList();
        }
        return this.instance;
    }

    public request(option: RequestOption<CUS40000Request, CUS40000Response>) {
        this.networkService.request({
            trCode: "CUS40000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: CUS40000Response = {
                totalCount: response.totalCount ?? 0,
                priceList: (response.priceList ?? []) as PriceGroupRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
