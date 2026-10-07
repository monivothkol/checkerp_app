import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { AttendanceFilter, ATD15000Response, AttendanceSummaryRow } from "@/models/POS/ATD/ATD10000";

export default class RetrieveAttendanceSummary implements IRequest<AttendanceFilter, ATD15000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveAttendanceSummary;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveAttendanceSummary {
        if (!this.instance) {
            this.instance = new RetrieveAttendanceSummary();
        }
        return this.instance;
    }

    public request(option: RequestOption<AttendanceFilter, ATD15000Response>) {
        this.networkService.request({
            trCode: "ATD10000I02",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: ATD15000Response = {
                summary: (response.summary ?? []) as AttendanceSummaryRow[],
                total: response.total ?? 0
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
