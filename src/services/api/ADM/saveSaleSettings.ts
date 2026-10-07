import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SaleSettings } from "@/models/POS/ADM/ADM50000";

export default class SaveSaleSettings implements IRequest<SaleSettings, Record<string, unknown>> {
    private readonly networkService: HttpNetworkService;
    private static instance: SaveSaleSettings;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): SaveSaleSettings {
        if (!this.instance) { this.instance = new SaveSaleSettings(); }
        return this.instance;
    }
    public request(option: RequestOption<SaleSettings, Record<string, unknown>>) {
        this.networkService.request({
            trCode: "ADM50000I02",
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
