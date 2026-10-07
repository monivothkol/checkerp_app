import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { SaleSettings } from "@/models/POS/ADM/ADM50000";

export default class RetrieveSaleSettings implements IRequest<Record<string, never>, SaleSettings> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveSaleSettings;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveSaleSettings {
        if (!this.instance) { this.instance = new RetrieveSaleSettings(); }
        return this.instance;
    }
    public request(option: RequestOption<Record<string, never>, SaleSettings>) {
        this.networkService.request({
            trCode: "ADM50000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as SaleSettings);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
