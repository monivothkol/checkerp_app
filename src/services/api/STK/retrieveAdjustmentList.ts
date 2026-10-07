import HttpNetworkService from "@/services/http-network-service";
import type { IRequest, RequestOption } from "../api-request-option";
import type { STK30000Request, STK30000Response, AdjustmentRow } from "@/models/POS/STK/STK30000";

export default class RetrieveAdjustmentList implements IRequest<STK30000Request, STK30000Response> {
    private readonly networkService: HttpNetworkService;
    private static instance: RetrieveAdjustmentList;

    private constructor() {
        this.networkService = HttpNetworkService.getInstance();
    }

    public static getInstance(): RetrieveAdjustmentList {
        if (!this.instance) {
            this.instance = new RetrieveAdjustmentList();
        }
        return this.instance;
    }

    public request(option: RequestOption<STK30000Request, STK30000Response>) {
        this.networkService.request({
            trCode: "STK30000I01",
            reqBody: option.dataBody,
            enableLoading: option.enableLoading,
            stateProps: option.stateProps,
            loadingBtn: option.loadingBtn
        }).then((response) => {
            const result: STK30000Response = {
                totalCount: response.totalCount ?? 0,
                adjustmentList: (response.adjustmentList ?? []) as AdjustmentRow[]
            };
            option.listener?.onSuccess(result);
        }).catch((err) => {
            option.listener?.onFail?.(err);
        });
    }
}
