import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";

export interface AsOfDateReportRequest {
    asOfDate?: string;
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default class RetrieveBalanceSheet implements IRequest<AsOfDateReportRequest, Record<string, any>> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveBalanceSheet;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveBalanceSheet {
        if (!this.instance) { this.instance = new RetrieveBalanceSheet(); }
        return this.instance;
    }
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    public request(option: RequestOption<AsOfDateReportRequest, Record<string, any>>) {
        this.networkService.request({
            trCode: "ACT31000I01",
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
