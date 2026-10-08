import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { RecordLeaveRequest, RecordLeaveResponse } from "@/models/POS/ATD/ATD10000";

/** ATD10000I04 — record Not scanned days as approved leave (deducts the leave balance). */
export default class RecordAbsenceLeave implements IRequest<RecordLeaveRequest, RecordLeaveResponse> {
    private readonly networkService: HttpNetworkService;
    private static instance: RecordAbsenceLeave;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RecordAbsenceLeave {
        if (!this.instance) {
            this.instance = new RecordAbsenceLeave();
        }
        return this.instance;
    }

    public request(option: RequestOption<RecordLeaveRequest, RecordLeaveResponse>) {
        this.networkService.request({
            trCode: "ATD10000I04",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as RecordLeaveResponse);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
