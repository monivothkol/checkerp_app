import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { StoreInfo } from "@/models/POS/ADM/ADM30000";

export default class RetrieveStoreInfo implements IRequest<Record<string, never>, StoreInfo> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveStoreInfo;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveStoreInfo {
        if (!this.instance) { this.instance = new RetrieveStoreInfo(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, StoreInfo>) {
        this.networkService.request({
            trCode: "ADM30000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as StoreInfo);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
