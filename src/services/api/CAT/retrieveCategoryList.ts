import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LookupRequest, CategoryLookupResponse, CategoryLookup } from "@/models/POS/COMMON/lookups";

export default class RetrieveCategoryList implements IRequest<LookupRequest, CategoryLookupResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveCategoryList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveCategoryList {
        if (!this.instance) {
            this.instance = new RetrieveCategoryList();
        }
        return this.instance;
    }

    public request(option: RequestOption<LookupRequest, CategoryLookupResponse>) {
        this.networkService.request({
            trCode: "CAT10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: CategoryLookupResponse = {
                totalCount: response.totalCount ?? 0,
                categoryList: (response.categoryList ?? []) as CategoryLookup[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
