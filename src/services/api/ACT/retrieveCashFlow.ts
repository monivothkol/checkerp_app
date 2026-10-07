import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { DateRangeReportRequest } from "./retrieveIncomeStatement";
import type { CashFlowResponse } from "@/models/ACT/ACT34000";

/** ACT34000I01 - cash flow (direct method) for a date range. */
export default class RetrieveCashFlow implements IRequest<DateRangeReportRequest, CashFlowResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveCashFlow;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveCashFlow {
        if (!this.instance) { this.instance = new RetrieveCashFlow(); }
        return this.instance;
    }
    public request(option: RequestOption<DateRangeReportRequest, CashFlowResponse>) {
        this.networkService.request({
            trCode: "ACT34000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as CashFlowResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
