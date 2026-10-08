import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD31000UpdateRequest, ATD31000Response } from "@/models/POS/ATD/ATD30000";

/** ATD31000I02 — edit a work schedule. */
export default class UpdateSchedule implements IRequest<ATD31000UpdateRequest, ATD31000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: UpdateSchedule;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): UpdateSchedule {
        if (!this.instance) {
            this.instance = new UpdateSchedule();
        }
        return this.instance;
    }

    public request(option: RequestOption<ATD31000UpdateRequest, ATD31000Response>) {
        this.networkService.request({
            trCode: "ATD31000I02",
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
