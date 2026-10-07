import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { BakongInfo } from "@/models/POS/ADM/ADM60000";

export default class RetrieveBakongInfo implements IRequest<Record<string, never>, BakongInfo> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveBakongInfo;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveBakongInfo {
        if (!this.instance) { this.instance = new RetrieveBakongInfo(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, BakongInfo>) {
        this.networkService.request({
            trCode: "ADM60000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as BakongInfo);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
