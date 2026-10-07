import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { POS10000Request, POS10000Response, PosProductRow } from "@/models/POS/SAL/POS10000";

export default class RetrievePosProducts implements IRequest<POS10000Request, POS10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePosProducts;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePosProducts {
        if (!this.instance) {
            this.instance = new RetrievePosProducts();
        }
        return this.instance;
    }

    public request(option: RequestOption<POS10000Request, POS10000Response>) {
        this.networkService.request({
            trCode: "POS10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: POS10000Response = {
                totalCount: response.totalCount ?? 0,
                productList: (response.productList ?? []) as PosProductRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
