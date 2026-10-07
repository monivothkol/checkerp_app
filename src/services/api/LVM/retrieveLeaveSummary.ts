import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { LeaveSummaryRequest, LeaveSummaryResponse } from "@/models/POS/LVM/LVM40000";

/** LVM40000I02 - per-type used/total leave summary for a year. */
export default class RetrieveLeaveSummary implements IRequest<LeaveSummaryRequest, LeaveSummaryResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveLeaveSummary;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveLeaveSummary {
        if (!this.instance) {
            this.instance = new RetrieveLeaveSummary();
        }
        return this.instance;
    }

    public request(option: RequestOption<LeaveSummaryRequest, LeaveSummaryResponse>) {
        this.networkService.request({
            trCode: "LVM40000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as LeaveSummaryResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
