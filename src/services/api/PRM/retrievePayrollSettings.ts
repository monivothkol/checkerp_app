import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { PRM30000Response } from "@/models/POS/PRM/PRM30000";

export default class RetrievePayrollSettings implements IRequest<Record<string, unknown>, PRM30000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrievePayrollSettings;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrievePayrollSettings {
        if (!this.instance) {
            this.instance = new RetrievePayrollSettings();
        }
        return this.instance;
    }

    public request(option: RequestOption<Record<string, unknown>, PRM30000Response>) {
        this.networkService.request({
            trCode: "PRM30000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as PRM30000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
