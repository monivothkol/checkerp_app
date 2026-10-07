import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD14000Request, ATD14000Response } from "@/models/POS/ATD/ATD10000";

export default class RetrieveAttendanceDetail implements IRequest<ATD14000Request, ATD14000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveAttendanceDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveAttendanceDetail {
        if (!this.instance) {
            this.instance = new RetrieveAttendanceDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<ATD14000Request, ATD14000Response>) {
        this.networkService.request({
            trCode: "ATD14000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as ATD14000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
