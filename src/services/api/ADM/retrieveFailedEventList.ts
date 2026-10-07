import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { ADM80000Request, ADM80000Response, FailedEventRow } from "@/models/POS/ADM/ADM80000";

export default class RetrieveFailedEventList implements IRequest<ADM80000Request, ADM80000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveFailedEventList;
    private constructor() { this.networkService = HttpNetworkService.getInstance(); }
    public static getInstance(): RetrieveFailedEventList {
        if (!this.instance) { this.instance = new RetrieveFailedEventList(); }
        return this.instance;
    }
    public request(option: RequestOption<ADM80000Request, ADM80000Response>) {
        this.networkService.request({
            trCode: "ADM80000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: ADM80000Response = {
                totalCount: response.totalCount ?? 0,
                pendingCount: response.pendingCount ?? 0,
                eventList: (response.eventList ?? []) as FailedEventRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => { option.listener?.onFail?.(err); });
    }
}
