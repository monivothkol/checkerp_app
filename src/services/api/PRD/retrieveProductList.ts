import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PRD10000Request, PRD10000Response, ProductListItem } from "@/models/PRD/PRD10000";

export default class RetrieveProductList implements IRequest<PRD10000Request, PRD10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveProductList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveProductList {
        if (!this.instance) {
            this.instance = new RetrieveProductList();
        }
        return this.instance;
    }

    public request(option: RequestOption<PRD10000Request, PRD10000Response>) {
        this.networkService.request({
            trCode: "PRD10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: PRD10000Response = {
                totalCount: response.totalCount ?? 0,
                productList: (response.productList ?? []) as ProductListItem[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
