import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default class RetrieveAccountingOverview implements IRequest<Record<string, never>, Record<string, any>> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveAccountingOverview;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveAccountingOverview {
        if (!this.instance) { this.instance = new RetrieveAccountingOverview(); }
        return this.instance;
    }
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    public request(option: RequestOption<Record<string, never>, Record<string, any>>) {
        this.networkService.request({
            trCode: "ACT10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            option.listener?.onSuccess(response as Record<string, any>);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
