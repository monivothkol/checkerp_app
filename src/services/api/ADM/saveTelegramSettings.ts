import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export default class SaveTelegramSettings implements IRequest<Record<string, unknown>, Record<string, unknown>> {
    private readonly networkService: HttpNetworkService;
    private static instance: SaveTelegramSettings;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): SaveTelegramSettings {
        if (!this.instance) { this.instance = new SaveTelegramSettings(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, unknown>, Record<string, unknown>>) {
        this.networkService.request({
            trCode: "ADM71000I01",
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
