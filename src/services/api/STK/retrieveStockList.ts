import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { STK10000Request, STK10000Response, StockRow } from "@/models/POS/STK/STK10000";

export default class RetrieveStockList implements IRequest<STK10000Request, STK10000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveStockList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveStockList {
        if (!this.instance) {
            this.instance = new RetrieveStockList();
        }
        return this.instance;
    }

    public request(option: RequestOption<STK10000Request, STK10000Response>) {
        this.networkService.request({
            trCode: "STK10000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: STK10000Response = {
                totalCount: response.totalCount ?? 0,
                stockList: (response.stockList ?? []) as StockRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
