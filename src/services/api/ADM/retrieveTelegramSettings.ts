import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { TelegramSettings } from "@/models/POS/ADM/ADM70000";

export default class RetrieveTelegramSettings implements IRequest<Record<string, never>, TelegramSettings> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveTelegramSettings;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveTelegramSettings {
        if (!this.instance) { this.instance = new RetrieveTelegramSettings(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, TelegramSettings>) {
        this.networkService.request({
            trCode: "ADM70000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as TelegramSettings);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
