import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { AttendanceRules } from "@/models/POS/ATD/ATD50000";

export default class SaveAttendanceRules implements IRequest<AttendanceRules, Record<string, unknown>> {
    private readonly networkService: HttpNetworkService;
    private static instance: SaveAttendanceRules;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): SaveAttendanceRules {
        if (!this.instance) {
            this.instance = new SaveAttendanceRules();
        }
        return this.instance;
    }

    public request(option: RequestOption<AttendanceRules, Record<string, unknown>>) {
        this.networkService.request({
            trCode: "ATD50000I02",
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
