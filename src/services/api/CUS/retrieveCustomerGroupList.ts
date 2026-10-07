import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LookupRequest } from "@/models/POS/COMMON/lookups";
import type { CustomerGroupListResponse, CustomerGroupLookup } from "@/models/POS/CUS/CUS40000";

export default class RetrieveCustomerGroupList implements IRequest<LookupRequest, CustomerGroupListResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveCustomerGroupList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveCustomerGroupList {
        if (!this.instance) {
            this.instance = new RetrieveCustomerGroupList();
        }
        return this.instance;
    }

    public request(option: RequestOption<LookupRequest, CustomerGroupListResponse>) {
        this.networkService.request({
            trCode: "CUS20000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: CustomerGroupListResponse = {
                groupList: (response.groupList ?? []) as CustomerGroupLookup[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
