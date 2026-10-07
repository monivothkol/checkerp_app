import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { DateRangeReportRequest } from "./retrieveIncomeStatement";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default class RetrieveTrialBalance implements IRequest<DateRangeReportRequest, Record<string, any>> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveTrialBalance;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveTrialBalance {
        if (!this.instance) { this.instance = new RetrieveTrialBalance(); }
        return this.instance;
    }
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    public request(option: RequestOption<DateRangeReportRequest, Record<string, any>>) {
        this.networkService.request({
            trCode: "ACT32000I01",
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
