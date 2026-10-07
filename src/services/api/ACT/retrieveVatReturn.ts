import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { DateRangeReportRequest } from "./retrieveIncomeStatement";
import type { VatReturnResponse } from "@/models/ACT/ACT36000";

/** ACT36000I01 — VAT return for a period. */
export default class RetrieveVatReturn implements IRequest<DateRangeReportRequest, VatReturnResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveVatReturn;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveVatReturn {
        if (!this.instance) { this.instance = new RetrieveVatReturn(); }
        return this.instance;
    }
    public request(option: RequestOption<DateRangeReportRequest, VatReturnResponse>) {
        this.networkService.request({
            trCode: "ACT36000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as VatReturnResponse);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
