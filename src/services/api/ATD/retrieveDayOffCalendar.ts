import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD60000Request, ATD60000Response } from "@/models/POS/ATD/ATD60000";

/** ATD60000I01 — day-off marks for a date range + the staff that can be marked. */
export default class RetrieveDayOffCalendar implements IRequest<ATD60000Request, ATD60000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveDayOffCalendar;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveDayOffCalendar {
        if (!this.instance) {
            this.instance = new RetrieveDayOffCalendar();
        }
        return this.instance;
    }

    public request(option: RequestOption<ATD60000Request, ATD60000Response>) {
        this.networkService.request({
            trCode: "ATD60000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn,
            headers: option.headers
        }).then((response) => {
            option.listener?.onSuccess(response as ATD60000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
