import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD34000Request, ATD34000Response } from "@/models/POS/ATD/ATD30000";

export default class RetrieveScheduleDetail implements IRequest<ATD34000Request, ATD34000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveScheduleDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveScheduleDetail {
        if (!this.instance) {
            this.instance = new RetrieveScheduleDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<ATD34000Request, ATD34000Response>) {
        this.networkService.request({
            trCode: "ATD34000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as ATD34000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
