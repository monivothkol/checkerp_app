import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LookupRequest, CustomerLookupResponse, CustomerLookup } from "@/models/POS/COMMON/lookups";

export default class RetrieveCustomerList implements IRequest<LookupRequest, CustomerLookupResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveCustomerList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveCustomerList {
        if (!this.instance) {
            this.instance = new RetrieveCustomerList();
        }
        return this.instance;
    }

    public request(option: RequestOption<LookupRequest, CustomerLookupResponse>) {
        this.networkService.request({
            trCode: "CUS10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: CustomerLookupResponse = {
                totalCount: response.totalCount ?? 0,
                customerList: (response.customerList ?? []) as CustomerLookup[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
