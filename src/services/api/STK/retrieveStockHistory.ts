import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { STK40000Request, STK40000Response, HistoryRow } from "@/models/POS/STK/STK40000";

export default class RetrieveStockHistory implements IRequest<STK40000Request, STK40000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveStockHistory;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveStockHistory {
        if (!this.instance) {
            this.instance = new RetrieveStockHistory();
        }
        return this.instance;
    }

    public request(option: RequestOption<STK40000Request, STK40000Response>) {
        this.networkService.request({
            trCode: "STK40000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: STK40000Response = {
                totalCount: response.totalCount ?? 0,
                historyList: (response.historyList ?? []) as HistoryRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
