import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { StoreOperationSettings } from "@/models/POS/ADM/ADM40000";

export default class SaveStoreOperationSettings implements IRequest<StoreOperationSettings, Record<string, unknown>> {
    private readonly networkService: HttpNetworkService;
    private static instance: SaveStoreOperationSettings;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): SaveStoreOperationSettings {
        if (!this.instance) { this.instance = new SaveStoreOperationSettings(); }
        return this.instance;
    }
    public request(option: RequestOption<StoreOperationSettings, Record<string, unknown>>) {
        this.networkService.request({
            trCode: "ADM41000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as Record<string, unknown>);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
