import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PUR20000Request, PUR20000Response, PurchaseInRow } from "@/models/POS/PUR/PUR20000";

export default class RetrievePurchaseInList implements IRequest<PUR20000Request, PUR20000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePurchaseInList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePurchaseInList {
        if (!this.instance) {
            this.instance = new RetrievePurchaseInList();
        }
        return this.instance;
    }

    public request(option: RequestOption<PUR20000Request, PUR20000Response>) {
        this.networkService.request({
            trCode: "PUR20000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: PUR20000Response = {
                totalCount: response.totalCount ?? 0,
                totals: response.totals,
                purchaseInList: (response.purchaseInList ?? []) as PurchaseInRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
