import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PUR10000Request, PUR10000Response, PurchaseOrderRow } from "@/models/POS/PUR/PUR10000";

export default class RetrievePurchaseOrderList implements IRequest<PUR10000Request, PUR10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePurchaseOrderList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePurchaseOrderList {
        if (!this.instance) {
            this.instance = new RetrievePurchaseOrderList();
        }
        return this.instance;
    }

    public request(option: RequestOption<PUR10000Request, PUR10000Response>) {
        this.networkService.request({
            trCode: "PUR10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: PUR10000Response = {
                totalCount: response.totalCount ?? 0,
                totals: response.totals,
                poList: (response.poList ?? []) as PurchaseOrderRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
