import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LookupRequest, BrandLookupResponse, BrandLookup } from "@/models/POS/COMMON/lookups";

export default class RetrieveBrandList implements IRequest<LookupRequest, BrandLookupResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveBrandList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveBrandList {
        if (!this.instance) {
            this.instance = new RetrieveBrandList();
        }
        return this.instance;
    }

    public request(option: RequestOption<LookupRequest, BrandLookupResponse>) {
        this.networkService.request({
            trCode: "BRD10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: BrandLookupResponse = {
                totalCount: response.totalCount ?? 0,
                brandList: (response.brandList ?? []) as BrandLookup[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
