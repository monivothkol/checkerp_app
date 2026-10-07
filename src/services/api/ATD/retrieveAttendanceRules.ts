import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD50000Response } from "@/models/POS/ATD/ATD50000";

export default class RetrieveAttendanceRules implements IRequest<Record<string, unknown>, ATD50000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveAttendanceRules;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveAttendanceRules {
        if (!this.instance) {
            this.instance = new RetrieveAttendanceRules();
        }
        return this.instance;
    }

    public request(option: RequestOption<Record<string, unknown>, ATD50000Response>) {
        this.networkService.request({
            trCode: "ATD50000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as ATD50000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
