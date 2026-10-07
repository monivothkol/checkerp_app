import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { STK13000Response } from "@/models/POS/STK/STK13000";

export interface STK13000Request { productCode: string; }

export default class RetrieveStockDetail implements IRequest<STK13000Request, STK13000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveStockDetail;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveStockDetail {
        if (!this.instance) {
            this.instance = new RetrieveStockDetail();
        }
        return this.instance;
    }

    public request(option: RequestOption<STK13000Request, STK13000Response>) {
        this.networkService.request({
            trCode: "STK13000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            option.listener?.onSuccess(response as STK13000Response);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
