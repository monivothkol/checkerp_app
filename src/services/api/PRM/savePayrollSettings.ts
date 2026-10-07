import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PayrollSettings } from "@/models/POS/PRM/PRM30000";

export default class SavePayrollSettings implements IRequest<PayrollSettings, Record<string, unknown>> {
    private readonly networkService: HttpNetworkService;
    private static instance: SavePayrollSettings;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): SavePayrollSettings {
        if (!this.instance) {
            this.instance = new SavePayrollSettings();
        }
        return this.instance;
    }

    public request(option: RequestOption<PayrollSettings, Record<string, unknown>>) {
        this.networkService.request({
            trCode: "PRM30000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as Record<string, unknown>);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
