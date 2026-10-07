import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ATD30000Request, ATD30000Response, ScheduleRow } from "@/models/POS/ATD/ATD30000";

export default class RetrieveScheduleList implements IRequest<ATD30000Request, ATD30000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveScheduleList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveScheduleList {
        if (!this.instance) {
            this.instance = new RetrieveScheduleList();
        }
        return this.instance;
    }

    public request(option: RequestOption<ATD30000Request, ATD30000Response>) {
        this.networkService.request({
            trCode: "ATD30000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: ATD30000Response = {
                totalCount: response.totalCount ?? 0,
                scheduleList: (response.scheduleList ?? []) as ScheduleRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
