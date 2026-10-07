import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD31000Request, ATD31000Response } from "@/models/POS/ATD/ATD30000";

export default class CreateSchedule implements IRequest<ATD31000Request, ATD31000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: CreateSchedule;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): CreateSchedule {
        if (!this.instance) {
            this.instance = new CreateSchedule();
        }
        return this.instance;
    }

    public request(option: RequestOption<ATD31000Request, ATD31000Response>) {
        this.networkService.request({
            trCode: "ATD31000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as ATD31000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
