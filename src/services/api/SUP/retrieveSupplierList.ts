import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LookupRequest, SupplierLookupResponse, SupplierLookup } from "@/models/POS/COMMON/lookups";

export default class RetrieveSupplierList implements IRequest<LookupRequest, SupplierLookupResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSupplierList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveSupplierList {
        if (!this.instance) {
            this.instance = new RetrieveSupplierList();
        }
        return this.instance;
    }

    public request(option: RequestOption<LookupRequest, SupplierLookupResponse>) {
        this.networkService.request({
            trCode: "SUP10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: SupplierLookupResponse = {
                totalCount: response.totalCount ?? 0,
                supplierList: (response.supplierList ?? []) as SupplierLookup[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
