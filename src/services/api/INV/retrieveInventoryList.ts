import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LookupRequest, InventoryLookupResponse, InventoryLookup } from "@/models/POS/COMMON/lookups";

export default class RetrieveInventoryList implements IRequest<LookupRequest, InventoryLookupResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveInventoryList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveInventoryList {
        if (!this.instance) {
            this.instance = new RetrieveInventoryList();
        }
        return this.instance;
    }

    public request(option: RequestOption<LookupRequest, InventoryLookupResponse>) {
        this.networkService.request({
            trCode: "INV10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: InventoryLookupResponse = {
                totalCount: response.totalCount ?? 0,
                inventoryList: (response.inventoryList ?? []) as InventoryLookup[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
