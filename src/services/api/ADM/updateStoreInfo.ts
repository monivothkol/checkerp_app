import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ADM31000Request } from "@/models/POS/ADM/ADM30000";

export default class UpdateStoreInfo implements IRequest<ADM31000Request, Record<string, unknown>> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateStoreInfo;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): UpdateStoreInfo {
        if (!this.instance) { this.instance = new UpdateStoreInfo(); }
        return this.instance;
    }
    public request(option: RequestOption<ADM31000Request, Record<string, unknown>>) {
        this.networkService.request({
            trCode: "ADM31000I01",
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
