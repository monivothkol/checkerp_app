import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { StoreOperationSettings } from "@/models/POS/ADM/ADM40000";

export default class RetrieveStoreOperationSettings implements IRequest<Record<string, never>, StoreOperationSettings> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveStoreOperationSettings;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveStoreOperationSettings {
        if (!this.instance) { this.instance = new RetrieveStoreOperationSettings(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, StoreOperationSettings>) {
        this.networkService.request({
            trCode: "ADM40000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as StoreOperationSettings);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
